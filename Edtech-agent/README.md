# Edy — Agente de voz EdTech

Agente de voz que ayuda a estudiantes a explorar cursos, inscribirse y resolver dudas. Se integra con la plataforma **EduPlatform** (Next.js) y vive en una sala de **LiveKit** (`edtech-widget`) a la que entra automáticamente cuando un estudiante abre el widget.

También existe [`CLAUDE.md`](CLAUDE.md) (notas de implementación para el agente) y [`PLAN.md`](PLAN.md) (plan original). Este README es el fuente de verdad para levantar y operar el agente.

## Arquitectura

Edy no se conecta "a mano" a la sala: usa el modelo **Worker + Dispatch** de LiveKit Agents.

```
Frontend (Next.js)
   │  POST /api/agent/token  →  firma token del estudiante + CreateAgentDispatch(agent_name="edy")
   ▼
LiveKit Cloud  ──  busca worker registrado como "edy"  ──▶  este agente
   │                                                              │
   │  crea sala + le envía el job                                 │
   ▼                                                              ▼
estudiante se une a la sala "edtech-widget"        entrypoint(ctx) se ejecuta
                                                   ctx.connect(AUDIO_ONLY)
                                                   AgentSession.start(EdyAgent)
                                                   generate_reply(saludo)
                          ◀── data channel: {"type":"agent_speech","text":...} ──
```

- **Worker**: este proceso Python. Registrado en LiveKit Cloud con `agent_name="edy"` vía `cli.run_app(WorkerOptions(...))`.
- **Dispatch**: el Next.js llama a `CreateAgentDispatch` (`src/app/api/agent/token/route.ts`); LiveKit Cloud busca un worker con `agent_name="edy"` y le asigna la sala.
- **Sala**: `edtech-widget` (configurable con `LIVEKIT_ROOM`).
- **Pipeline de voz**: VAD **Silero** → STT **Deepgram Nova-2** (es) → LLM **NVIDIA NIM** (`stepfun-ai/step-3.7-flash` por defecto) → texto por data channel (no TTS de audio, el frontend usa `speechSynthesis`).

## Configuración

### 1. Variables de entorno
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales reales. Variables requeridas:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `LIVEKIT_URL` | URL WSS de tu proyecto LiveKit Cloud | `wss://edutech-meo77bh3.livekit.cloud` |
| `LIVEKIT_API_KEY` | API key del proyecto LiveKit | `APIxxxxx` |
| `LIVEKIT_API_SECRET` | API secret del proyecto LiveKit | `secretxxxxx` |
| `LIVEKIT_ROOM` | Nombre de la sala a la que se une el worker | `edtech-widget` |
| `DEEPGRAM_API_KEY` | API key de Deepgram (STT) | `7dda7ab7..."` |
| `NVIDIA_API_KEY` | API key de NVIDIA NIM (LLM) | `nvapi-...` |
| `NVIDIA_BASE_URL` | Endpoint NIM (opcional, ya tiene default) | `https://integrate.api.nvidia.com/v1` |
| `NVIDIA_LLM_MODEL` | Modelo NIM (opcional, ya tiene default) | `stepfun-ai/step-3.7-flash` |
| `BACKEND_BASE_URL` | URL del frontend Next.js | `http://localhost:3000` |
| `BACKEND_API_PREFIX` | Prefijo de los endpoints del agente | `/api/agent` |

> Las variables **deben coincidir** con las del `.env.local` del Next.js (`LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`). Si difieren, el dispatch del frontend no encontrará a este worker y el agente nunca se unirá a la sala.

### 2. Crear el entorno virtual e instalar dependencias
```bash
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

> El proyecto incluye un venv ya creado en `Edtech-agent\venv\` que ya tiene todas las dependencias instaladas.

### 3. Levantar el frontend (en otra terminal)
```bash
cd ../PlatformEdu-ASB
npm install
npm run dev
# http://localhost:3000
```

### 4. Arrancar el agente
```bash
python main.py dev
```

Salida esperada en consola:
```
[INFO] livekit.agents: starting worker
[INFO] livekit.agents: plugin registered      (3 plugins: openai, silero, deepgram)
[INFO] livekit.agents: HTTP server listening on :NNNNN
[INFO] livekit.agents: registered worker       ← listo para recibir dispatches
```

Cuando un estudiante abra el widget se verá:
```
[INFO] livekit.agents: received job request  {room: "edtech-widget", agent_name: "edy"}
[INFO] livekit.agents: initializing job runner
[INFO] edy: Agent joined room: edtech-widget
[INFO] httpx: HTTP Request: POST .../chat/completions "HTTP/1.1 200 OK"
[INFO] edy: Sent agent speech via data channel: ...
```

### 5. Probarlo
Abre en el navegador [http://localhost:3000/agente-edy](http://localhost:3000/agente-edy). Permite acceso al micrófono. Edy te saludará en español y podrás conversarle. En la consola del navegador verás `[EdyWidget] Participant connected: edy` cuando el agente entre a la sala.

> El `start-all.bat` de la carpeta padre (`Seccion6/`) arranca ambos procesos (agente + Next.js) en ventanas separadas con un solo comando.

## Estructura del código

| Archivo | Rol |
|---|---|
| [`main.py`](main.py) | Entrypoint LiveKit. Registra el worker (`WorkerOptions(agent_name="edy")`) y define `entrypoint(ctx)` que conecta al room y arranca el `AgentSession` con Deepgram + Silero + NVIDIA. |
| [`prompt.py`](prompt.py) | `build_system_prompt(session)` — instrucciones del sistema + estado de la sesión. |
| [`tools.py`](tools.py) | `build_tool_functions(session, backend)` — 5 `@function_tool` que el LLM puede llamar. |
| [`session.py`](session.py) | `StudentSession` — estado in-memory por sesión (email, recomendaciones, inscripciones). |
| [`backend_client.py`](backend_client.py) | Cliente `httpx.AsyncClient` para `${BACKEND_BASE_URL}${BACKEND_API_PREFIX}/*` (las routes del Next.js). |

## Tools disponibles (function tools)

| Tool | Descripción |
|---|---|
| `get_courses(category?)` | Lista cursos publicados. Opcionalmente filtra por categoría (UUID). |
| `get_course_detail(course_id)` | Detalle completo de un curso (instructor, descripción, precio). |
| `get_course_lessons(course_id)` | Lecciones de un curso. Requiere estar inscrito; array vacío si no lo estás. |
| `enroll_student(course_id, confirmed)` | Inscribe al estudiante. **Solo** ejecuta la acción si `confirmed=true` y hay confirmación verbal explícita. |
| `escalate_to_advisor(reason, summary)` | Escala el caso a un asesor humano. Para reembolsos, problemas técnicos, reportes o convenios institucionales. |

## Endpoints del Next.js que consume el agente

| Método + Ruta | Usado por |
|---|---|
| `POST /api/agent/courses` | `get_courses` |
| `GET /api/agent/courses/[id]` | `get_course_detail` |
| `GET /api/agent/courses/[id]/lessons` | `get_course_lessons` |
| `POST /api/agent/courses/[id]/enroll` | `enroll_student` |
| `POST /api/agent/enroll` | endpoint de inscripción |
| `POST /api/agent/token` | firma el token del estudiante + `CreateAgentDispatch` |

## Pruebas manuales sugeridas

1. *"Quiero ver cursos de programación"* → Edy lista cursos del catálogo.
2. *"Cuéntame más del primero"* → Edy da el detalle del curso.
3. *"Inscríbeme"* → Edy pide confirmación verbal con nombre y precio.
4. *"Sí, adelante"* → se inscribe y lo confirma.
5. *"Mi pago no funcionó"* → Edy escala a un asesor automáticamente.

## Producción

Para correr en producción (sin logs DEBUG), usa `start` en vez de `dev`:

```bash
python main.py start
```

Los warnings de "`dev mode is deprecated`" desaparecerán cuando migres al CLI externo `lk agent dev main.py` (ver [docs LiveKit CLI](https://docs.livekit.io/reference/developer-tools/livekit-cli/#setup)), pero no bloquean el funcionamiento actual.

## Troubleshooting

- **`registered worker` no aparece**: revisa que `LIVEKIT_URL`, `LIVEKIT_API_KEY` y `LIVEKIT_API_SECRET` coincidan con las del `.env.local` del frontend. Un typo o apis de otro proyecto LiveKit produce 401 silencioso.
- **`DuplicateIdentity: edy-agent`**: hay otro processo del agente ya unido a la sala. Mata todos los `python.exe` del agente y reinicia.
- **El frontend ve 200 pero el agente nunca entra**: LiveKit Cloud no encontró un worker con `agent_name="edy"`. Verifica que el worker esté registrado y que en `token/route.ts` el `agent_name` sea `"edy"`.
- **`AttributeError: 'Room' object has no attribute 'subscribe'`**: ya está resuelto (se usa `AutoSubscribe.AUDIO_ONLY` en `ctx.connect`). Si reaparece, es que estás usando un `main.py` viejo.
