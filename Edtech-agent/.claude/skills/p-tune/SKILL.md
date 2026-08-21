# Skill: Ajustar Prompt de Edy

## Pasos
1. Leer `prompt.py` completo antes de tocar nada
2. Identificar la sección exacta del problema:

| Sección | Qué controla |
|---|---|
| Identidad y tono | Cómo habla Edy, nivel de formalidad |
| CONTEXTO DEL ESTUDIANTE | (dinámico — no modificar la estructura) |
| FLUJO DE LA SESIÓN | Pasos ordenados de la orientación |
| REGLAS | Restricciones de comportamiento |

3. Aplicar el cambio mínimo necesario
4. Verificar que siguen intactos: max 3 recomendaciones, confirmar precio antes de `enroll_student`, triggers de escalado
5. Probar: `python main.py dev` → `meet.livekit.io` → reproducir el escenario exacto

## Guía de tono por perfil
- **Universitario:** cercano, usa términos como bootcamp, stack, skills
- **Profesional en transición:** orientado a resultados, menciona salidas laborales
- **Indeciso:** preguntas abiertas, nunca presionar a inscribirse
