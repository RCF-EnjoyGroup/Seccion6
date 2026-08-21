# Edy — Agente de Voz EdTech

Agente de voz en Python que ayuda a estudiantes a elegir cursos y planear su carrera.

## Stack

- **Voz:** LiveKit Agents SDK — VAD (Silero) → STT (aws) → LLM (Bedrock) → TTS (aws)
- **LLM:** Claude 3.5 Sonnet via Amazon Bedrock
- **TTS:** Amazon Polly Neural, voz `Lupe` (es-US)
- **TTS:** Amazon Transcribe, voz `Lupe` (es-US)
- **Datos:** Supabase REST API del repo `jeffersonquispe/edtech`
- **HTTP:** `httpx.AsyncClient` (nunca `requests`)

## Archivos

```
main.py      # entrypoint y VoiceAssistant
prompt.py    # build_system_prompt(session) → str
tools.py     # build_tool_functions(session) → lista de @function_tool
session.py   # clase StudentSession
```

## Comandos

```bash
pip install -r requirements.txt
python main.py dev          # correr agente
# probar: meet.livekit.io → room: edtech-test
```

## Reglas que siempre aplican

- Solo recomendar cursos con `is_published = true`
- Máximo 3 recomendaciones por sesión
- Confirmar nombre y precio antes de llamar a `enroll_student`
- Llamar a `escalate_to_advisor` si el estudiante menciona reembolso, problema técnico o reporte de instructor
- Nunca revelar datos de otros estudiantes
- Todas las `@function_tool` son `async` y retornan `dict`
- `SUPABASE_SERVICE_ROLE_KEY` nunca se loggea

## Variables de entorno requeridas

```
LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION=us-east-1
SUPABASE_URL, SUPABASE_ANON_KEY
MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
```
