# Skill: Agregar Herramienta

## Preguntar al usuario
- Nombre (snake_case), qué hace, parámetros y tipos
- Qué tabla de Supabase usa: `courses`, `categories`, `enrollments`, `profiles`
- Nivel de acceso: anon key (lectura pública) o service role (writes/datos privados)

## Plantilla en `tools.py`

```python
@function_tool()
async def nombre_herramienta(
    context: RunContext,
    param1: str,
    param2: Optional[str] = None,
) -> dict:
    """Cuándo debe usar esta herramienta el LLM."""
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_ANON_KEY", "")  # o SERVICE_ROLE_KEY si aplica
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{url}/rest/v1/tabla?select=*&columna=eq.{param1}",
            headers={"apikey": key, "Authorization": f"Bearer {key}"},
        )
    return {"status": "ok", "data": resp.json()}
```

## Checklist
- [ ] Agregar la función al `return` de `build_tool_functions`
- [ ] Verificar que cursos retornados tengan `is_published=eq.true`
- [ ] Actualizar `prompt.py` si cambia el flujo de la sesión
- [ ] Si usa service role: agregar comentario explicando por qué
