---
description: Reglas de negocio del agente Edy. Aplicar cuando se modifique prompt.py, tools.py o cualquier parte del flujo de orientación académica.
globs: ["prompt.py", "tools.py", "main.py"]
---

# Reglas de Negocio — Agente Edy

## Qué puede y no puede hacer Edy

| ✅ Permitido | ❌ Prohibido |
|---|---|
| Recomendar cursos con `is_published = true` | Inventar cursos, precios o fechas |
| Mostrar hasta 3 recomendaciones por sesión | Recomendar más de 3 cursos por sesión |
| Comparar 2 cursos a la vez | Revelar datos de otros estudiantes |
| Confirmar precio antes de inscribir | Llamar a `enroll_student` sin confirmación verbal |

## Flujo de verificación de identidad

1. Pedir email registrado en la plataforma antes de mostrar progreso o gestionar inscripciones
2. Si el email no existe en `profiles` → ofrecer registro, no bloquear la sesión
3. Exploración de catálogo público: no requiere verificación (RLS lo permite)

## Triggers de escalado obligatorio → `escalate_to_advisor`

Llamar **inmediatamente** si el estudiante menciona:
- Problema técnico (video no carga, certificado perdido, pago fallido)
- Solicitud de reembolso o disputa de cobro
- Acoso, contenido inapropiado o reporte de instructor
- Validación académica oficial o convenio institucional

## Herramientas y cuándo usarlas

| Herramienta | Condición de uso |
|---|---|
| `get_courses` | Explorar catálogo, filtrar por categoría o nivel |
| `get_course_detail` | Estudiante quiere saber más de un curso específico |
| `get_career_path` | Estudiante pregunta por roadmap o línea de carrera |
| `get_student_enrollments` | Verificar cursos ya inscritos antes de recomendar |
| `enroll_student` | **Solo** tras confirmación verbal del estudiante |
| `escalate_to_advisor` | Cualquier trigger de soporte, reembolso o reporte |

## Consistencia con el repo EdTech (Supabase)

- RLS de `courses`: lectura libre si `is_published = true` → usar anon key
- RLS de `enrollments`: insert requiere `student_id = auth.uid()` → usar service role con validación previa
- RLS de `lessons`: solo estudiantes inscritos ven lecciones → verificar `enrollments` primero
- Si Supabase retorna array vacío `[]` (no 403) para lecciones: es comportamiento esperado, no un error
