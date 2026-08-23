"""
Edge TTS adapter for LiveKit Agents SDK.
Uses Microsoft Edge's free TTS service — no API key required.
Supports all Neural voices including Spanish (LatAm).
"""

from __future__ import annotations

import asyncio
import io
import struct
import logging
from typing import TYPE_CHECKING

import edge_tts

from livekit.agents import tts
from livekit.agents.types import APIConnectOptions, DEFAULT_API_CONNECT_OPTIONS

logger = logging.getLogger("edge-tts-adapter")

# Default voice — Colombian Spanish (neutral LatAm)
DEFAULT_VOICE = "es-CO-GonzaloNeural"


class EdgeTTS(tts.TTS):
    """Custom TTS implementation using Microsoft Edge TTS (free, no API key)."""

    def __init__(
        self,
        *,
        voice: str = DEFAULT_VOICE,
        rate: str = "+0%",
        volume: str = "+0%",
        pitch: str = "+0Hz",
    ) -> None:
        super().__init__(
            capabilities=tts.TTSCapabilities(streaming=False),
            sample_rate=24000,
            num_channels=1,
        )
        self._voice = voice
        self._rate = rate
        self._volume = volume
        self._pitch = pitch

    @property
    def model(self) -> str:
        return self._voice

    @property
    def provider(self) -> str:
        return "edge-tts"

    def synthesize(
        self,
        text: str,
        *,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
    ) -> tts.ChunkedStream:
        return EdgeTTSChunkedStream(
            tts_instance=self,
            input_text=text,
            conn_options=conn_options,
            voice=self._voice,
            rate=self._rate,
            volume=self._volume,
            pitch=self._pitch,
        )


class EdgeTTSChunkedStream(tts.ChunkedStream):
    """Chunked stream that synthesizes audio via Edge TTS."""

    def __init__(
        self,
        *,
        tts_instance: EdgeTTS,
        input_text: str,
        conn_options: APIConnectOptions,
        voice: str,
        rate: str,
        volume: str,
        pitch: str,
    ) -> None:
        super().__init__(
            tts=tts_instance,
            input_text=input_text,
            conn_options=conn_options,
        )
        self._voice = voice
        self._rate = rate
        self._volume = volume
        self._pitch = pitch

    async def _run(self, output_emitter: tts.AudioEmitter) -> None:
        """Synthesize text using Edge TTS and push audio frames."""
        request_id = f"edge-tts-{id(self)}"

        # Initialize the emitter with MP3 format (Edge TTS outputs MP3)
        output_emitter.initialize(
            request_id=request_id,
            sample_rate=24000,
            num_channels=1,
            mime_type="audio/mp3",
        )

        try:
            communicate = edge_tts.Communicate(
                text=self._input_text,
                voice=self._voice,
                rate=self._rate,
                volume=self._volume,
                pitch=self._pitch,
            )

            # Collect all audio chunks
            audio_data = bytearray()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data.extend(chunk["data"])

            if audio_data:
                output_emitter.push(bytes(audio_data))

        except Exception as e:
            logger.error(f"Edge TTS synthesis failed: {e}")
            raise

        output_emitter.end_input()
