---
description: Convenciones Python para todos los archivos .py del proyecto.
globs: ["**/*.py"]
---

# Convenciones Python

- Imports: stdlib → third-party → local, separados por línea en blanco
- `load_dotenv()` al inicio de `main.py`
- Todas las `@function_tool` son `async def` y retornan `dict`
- `httpx.AsyncClient` para llamadas a Supabase, nunca `requests`
- `os.getenv("VAR", "")` — nunca hardcodear credenciales
- Anotar tipos en parámetros de tools: `str`, `int`, `Optional[str] = None`
- Usar **anon key** para lectura pública de cursos; **service role** solo para writes que RLS bloquea
- Comentario obligatorio cuando se use service role: `# Requiere service role: RLS bloquea desde anon`
