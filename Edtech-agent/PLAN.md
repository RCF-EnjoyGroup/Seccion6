# Plan de Implementación — Edy (Agente de Voz EdTech)

Plan derivado de [CLAUDE.md](CLAUDE.md) y las reglas en [.claude/rules/](.claude/rules/).

---

## Fase 0 — Preparación del entorno (½ día)

**Objetivo:** ambiente local funcional con todas las credenciales validadas antes de tocar código.

- [ ] Crear `requirements.txt` con: `livekit-agents`, `livekit-plugins-aws`, `livekit-plugins-silero`, `boto3`, `httpx`, `python-dotenv`
- [ ] Crear `.env` con las 7 variables de [CLAUDE.md:43-47](CLAUDE.md#L43-L47) y agregar `.env` al `.gitignore`
- [ ] Verificar acceso a Bedrock (`anthropic.claude-3-5-sonnet-20241022-v2:0` en `us-east-1`)
- [ ] Verificar acceso a Polly (voz `Lupe` es-US) y Transcribe
- [ ] Crear sala de prueba `edtech-test` en LiveKit Cloud
- [ ] Validar el endpoint Supabase del repo `jeffersonquispe/edtech` con un `GET /rest/v1/courses?is_published=eq.true`

**Entregable:** `python -c "import livekit, boto3, httpx; print('ok')"` corre sin error.

---

## Fase 1 — Esqueleto del agente (1 día)

**Objetivo:** loop de voz mínimo VAD → STT → LLM → TTS sin tools, respondiendo en español.

### [session.py](session.py)
- Clase `StudentSession` con campos: `email: Optional[str]`, `student_id: Optional[str]`, `recommendations_count: int = 0`, `recommended_course_ids: list[str]`
- Método `can_recommend() -> bool` (límite de 3 por sesión, ver [CLAUDE.md:33](CLAUDE.md#L33))
- Método `register_recommendation(course_id: str)`

### [prompt.py](prompt.py)
- `build_system_prompt(session: StudentSession) -> str`
- Incluir: rol de Edy, idioma (es-US), reglas de [.claude/rules/business-logic(1)(1).md](.claude/rules/business-logic(1)(1).md)
- Inyectar estado dinámico: si ya hay email verificado, si quedan recomendaciones disponibles

### [main.py](main.py)
- `load_dotenv()` al inicio (ver [.claude/rules/python-conventions(2)(1).md](.claude/rules/python-conventions(2)(1).md))
- `entrypoint(ctx: JobContext)` con `VoiceAssistant`:
  - VAD: `silero.VAD.load()`
  - STT: AWS Transcribe (es-US)
  - LLM: Bedrock con `MODEL_ID` desde env
  - TTS: Polly Neural, voz `Lupe`
- `cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))`

**Entregable:** `python main.py dev` + meet.livekit.io en sala `edtech-test` → Edy saluda y mantiene conversación libre.

---

## Fase 2 — Capa de datos Supabase (1 día)

**Objetivo:** cliente HTTP async reutilizable con la separación correcta anon/service-role.

### Crear `supabase_client.py` (no listado en CLAUDE.md, pero necesario para no duplicar lógica)
- `SupabaseClient` con `httpx.AsyncClient` compartido
- Dos métodos privados: `_get(path, key=anon)` y `_post(path, body, key=service_role)`
- Anon por defecto para lecturas; service role solo cuando RLS bloquea (con comentario obligatorio según [.claude/rules/python-conventions(2)(1).md](.claude/rules/python-conventions(2)(1).md))
- Nunca loggear `SUPABASE_SERVICE_ROLE_KEY` ([CLAUDE.md:39](CLAUDE.md#L39))

### Tests manuales contra Supabase real
- `GET courses?is_published=eq.true` → debe devolver array
- `GET profiles?email=eq.<inexistente>` → array vacío `[]` esperado
- `GET lessons?course_id=eq.<sin inscripción>` → `[]` esperado, no 403 ([.claude/rules/business-logic(1)(1).md](.claude/rules/business-logic(1)(1).md))

**Entregable:** script ad-hoc que lista 5 cursos publicados desde la terminal.

---

## Fase 3 — Tools del catálogo (1-2 días)

**Objetivo:** 6 `@function_tool` async funcionando, todas devolviendo `dict`.

### [tools.py](tools.py) — `build_tool_functions(session) -> list`

| Tool | Key Supabase | Filtros | Notas |
|---|---|---|---|
| `get_courses(category, level)` | anon | `is_published=eq.true` | siempre filtrar publicados |
| `get_course_detail(course_id)` | anon | + lecciones, instructor | sin lecciones detalladas si no inscrito |
| `get_career_path(career_id)` | anon | tabla `career_paths` | roadmap ordenado |
| `get_student_enrollments(email)` | service role | resolver `email → student_id` primero | requiere verificación |
| `enroll_student(course_id, confirmed: bool)` | service role | rechazar si `confirmed=False` | requiere confirmación verbal |
| `escalate_to_advisor(reason, transcript_summary)` | service role | inserta en tabla `escalations` | siempre disponible |

### Reglas transversales
- Toda tool: `async def`, `dict` de retorno, anotaciones de tipo
- `enroll_student` debe verificar `recommendations_count` y bloquear si >3
- `enroll_student` actualiza `session.recommended_course_ids` para no inscribir dos veces
- Manejo de error: capturar `httpx.HTTPStatusError` y devolver `{"error": "...", "user_message": "..."}` para que el LLM lo verbalice

**Entregable:** prueba en vivo donde Edy lista cursos, da detalle de uno, y escala al detectar "quiero un reembolso".

---

## Fase 4 — Flujo de identidad y reglas de conversación (1 día)

**Objetivo:** Edy aplica las reglas duras de negocio, no solo las sugiere.

### En [prompt.py](prompt.py)
- Sección "Verificación de identidad" con los 3 pasos de [.claude/rules/business-logic(1)(1).md](.claude/rules/business-logic(1)(1).md)
- Sección "Triggers de escalado obligatorio" enumerada
- Sección "Confirmación antes de inscribir" — debe leer nombre + precio en voz alta antes de llamar `enroll_student`

### En [tools.py](tools.py)
- `enroll_student` rechaza `confirmed=False` con mensaje claro al LLM
- `get_student_enrollments` rechaza si `session.email is None` y pide al LLM solicitar email primero

### Pruebas de regresión manual (script de turnos)
1. "Quiero ver cursos de Python" → catálogo
2. "Inscríbeme al primero" → Edy debe pedir confirmación con precio
3. "Sí, confírmalo" → `enroll_student(confirmed=True)` se ejecuta
4. "Mi pago falló" → `escalate_to_advisor` se llama de inmediato
5. Pedir 4ta recomendación → Edy debe rechazar (límite de 3)

**Entregable:** los 5 escenarios anteriores pasan en una sola sesión.

---

## Fase 5 — Robustez y observabilidad (½ día)

- Logging estructurado: nivel INFO para tool calls, ERROR para fallas Supabase, **nunca** loggear keys
- Timeout de 10s en `httpx.AsyncClient`
- Mensaje de fallback cuando Bedrock devuelve error de throttling
- README mínimo con cómo levantar el agente y probarlo

**Entregable:** sesión de 10 minutos sin crashes, logs limpios.

---

## Riesgos y decisiones abiertas

| Riesgo | Mitigación |
|---|---|
| Latencia AWS Transcribe + Polly + Bedrock encadenados | Medir en Fase 1; si >2s, evaluar Deepgram STT |
| RLS de Supabase bloquea más de lo esperado | Validar cada tabla en Fase 2 antes de codear tools |
| Voz `Lupe` es-US suena rara para usuarios es-MX/es-PE | Confirmar con usuarios reales en Fase 5 |
| `enroll_student` podría inscribir dos veces si la confirmación falla a mitad | Idempotencia: chequear `enrollments` antes de insertar |

## Orden recomendado de PRs

1. Fase 0 + 1 → primer PR ("esqueleto del agente, sin tools")
2. Fase 2 → segundo PR ("cliente Supabase")
3. Fase 3 → tercer PR, una tool por commit dentro del PR
4. Fase 4 → cuarto PR ("reglas de negocio aplicadas")
5. Fase 5 → quinto PR ("logging y robustez")

**Tiempo total estimado:** 4-5 días de trabajo enfocado.
