import json
import logging
import os
import asyncio

from dotenv import load_dotenv

load_dotenv()

from livekit.agents import (
    Agent,
    AgentSession,
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    WorkerPermissions,
    cli,
    room_io,
)
from livekit.plugins import openai, silero
from livekit.plugins.deepgram import STT as DeepgramSTT
from livekit.plugins.elevenlabs import TTS as ElevenLabsTTS
from livekit import rtc
from livekit.agents.utils import http_context

from backend_client import BackendClient
from prompt import build_system_prompt
from session import StudentSession
from tools import build_tool_functions

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger("edy")
# Ver qué pasa dentro del pipeline del agente
logging.getLogger("livekit.agents").setLevel(logging.DEBUG)


class EdyAgent(Agent):
    def __init__(self, *args, room: rtc.Room, **kwargs):
        super().__init__(*args, **kwargs)
        self._room = room

    async def llm_node(
        self,
        chat_ctx,
        tools,
        model_settings,
    ):
        """Override llm_node to log and publish every assistant text chunk."""
        full_response = []
        async for chunk in super().llm_node(chat_ctx, tools, model_settings):
            if hasattr(chunk, "delta") and chunk.delta and chunk.delta.content:
                full_response.append(chunk.delta.content)
            yield chunk
        if full_response:
            text = "".join(full_response)
            log.info(f"[ASSISTANT_RESPONSE_FULL] {text}")
            payload = json.dumps({"type": "agent_speech", "text": text}).encode()
            try:
                await self._room.local_participant.publish_data(payload, reliable=True)
            except Exception as e:
                log.warning(f"[publish_data error] {e}")


async def entrypoint(ctx: JobContext) -> None:
    """LiveKit Agents entrypoint.

    LiveKit Cloud invoca esta función cuando el frontend pide un
    CreateAgentDispatch con agent_name="edy". El worker registro el
    agente con nombre "edy" (WorkerOptions.agent_name), por lo que
    LiveKit Cloud sabe a quién despachar a la sala.
    """
    ctx.log_context_fields = {"room": ctx.room.name}

    # Conectar a la sala creada por el dispatch; suscripción automática de audio.
    # Los permisos de publicación los define WorkerPermissions en WorkerOptions.
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    room = ctx.room
    log.info(f"Agent joined room: {room.name}")

    @room.on("participant_connected")
    def on_participant_connected(participant: rtc.RemoteParticipant):
        log.info(f"Participant connected: {participant.identity}")

    @room.on("participant_disconnected")
    def on_participant_disconnected(participant: rtc.RemoteParticipant):
        log.info(f"Participant disconnected: {participant.identity}")

    # Setup agent
    session = StudentSession()
    backend = BackendClient()

    tools = build_tool_functions(session, backend)

    agent = EdyAgent(
        instructions=build_system_prompt(session),
        tools=tools,
        room=room,
    )

    # Create STT within http_context
    async with http_context.open():
        stt = DeepgramSTT(
            model="nova-2",
            language="es",
            api_key=os.getenv("DEEPGRAM_API_KEY"),
        )

        # Voz femenina en español (Alice - Clear, Engaging Educator, premade).
        # eleven_turbo_v2_5 es multilingüe; con language="es" Lee español natural.
        tts = ElevenLabsTTS(
            voice_id=os.getenv("ELEVEN_VOICE_ID", "Xb7hH8MSUJpSbSDYk0k2"),
            model="eleven_turbo_v2_5",
            api_key=os.getenv("ELEVEN_API_KEY"),
            language="es",
        )

        agent_session = AgentSession(
            vad=silero.VAD.load(),
            stt=stt,
            llm=openai.LLM(
                model=os.getenv("NVIDIA_LLM_MODEL", "openai/gpt-oss-20b"),
                api_key=os.getenv("NVIDIA_API_KEY"),
                base_url=os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1"),
                max_completion_tokens=500,
                temperature=0.3,
                top_p=0.9,
                _strict_tool_schema=False,
            ),
            tts=tts,
        )

        await agent_session.start(
            agent=agent,
            room=room,
            room_options=room_io.RoomOptions(
                audio_input=room_io.AudioInputOptions(),
                audio_output=room_io.AudioOutputOptions(),
            ),
        )

        await agent_session.generate_reply(
            instructions="Di exactamente: Hola, soy Edy. ¿En qué puedo ayudarle hoy?"
        )

        # Keep running until the job is revoked/closed
        await asyncio.Event().wait()


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="edy",
            permissions=WorkerPermissions(
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True,
            ),
        )
    )
