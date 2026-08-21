# Skill: Agregar Estudiante de Prueba

## Escenarios comunes
| Escenario | Configuración |
|---|---|
| Explorador nuevo | Sin inscripciones |
| En transición | 1-2 cursos básicos inscritos |
| Estudiante avanzado | 3+ cursos, busca especialización |
| Trigger de escalado | Menciona reembolso o problema técnico |

## SQL en Supabase Dashboard → SQL Editor

```sql
-- Ver cursos disponibles
SELECT id, title FROM courses WHERE is_published = true LIMIT 10;

-- Insertar perfil
INSERT INTO profiles (id, full_name, role, avatar_url)
VALUES (gen_random_uuid(), 'Ana Torres', 'student', NULL);

-- Inscribir en cursos (opcional)
INSERT INTO enrollments (student_id, course_id)
VALUES ('UUID-DEL-PERFIL', 'UUID-CURSO');
```

## Activar en el agente

En `main.py`:
```python
student_id = ctx.room.metadata or "UUID-DEL-PERFIL-DE-PRUEBA"
```

O pasar el UUID como metadata del room desde `meet.livekit.io`.
