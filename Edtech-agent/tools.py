import logging
from typing import Optional

import httpx
from livekit.agents import function_tool

from backend_client import BackendClient
from session import StudentSession

log = logging.getLogger(__name__)

GENERIC_ERROR = "Tuve un problema consultando la información, ¿podemos intentarlo de nuevo en un momento?"


def _wrap_http_error(exc: Exception) -> dict:
    if isinstance(exc, httpx.HTTPStatusError):
        log.error("Backend HTTP %s on %s", exc.response.status_code, exc.request.url.path)
    else:
        log.exception("Backend call failed")
    return {"error": "backend_unavailable", "user_message": GENERIC_ERROR}


def _track_recommendations(session: StudentSession, course_ids: list[str]) -> None:
    for cid in course_ids:
        if not session.can_recommend():
            break
        session.register_recommendation(cid)


def build_tool_functions(session: StudentSession, backend: BackendClient) -> list:
    @function_tool
    async def get_courses(
        category: Optional[str] = None,
    ) -> dict:
        """Lista todos los cursos publicados del catálogo. Opcionalmente filtra por categoría (UUID)."""
        params = {}
        if category:
            params["category"] = category
        try:
            raw = await backend.get("/courses", params=params)
            # La API retorna { courses: [...], total, limit, offset }
            if isinstance(raw, dict):
                courses = raw.get("courses", [])
            elif isinstance(raw, list):
                courses = raw
            else:
                courses = []
        except Exception as exc:
            return _wrap_http_error(exc)
        _track_recommendations(session, [c.get("id") for c in courses if isinstance(c, dict) and "id" in c])
        return {
            "courses": courses,
            "count": len(courses),
            "recommendations_used": session.recommendations_count,
        }

    @function_tool
    async def search_courses(query: str, limit: int = 10) -> dict:
        """Busca cursos por palabra clave (ej: 'python', 'javascript', 'data science'). Usa búsqueda semántica y fallback de texto."""
        try:
            raw = await backend.get("/courses/search", params={"q": query, "limit": limit})
            # La API retorna { query, results: [...], count }
            if isinstance(raw, dict):
                courses = raw.get("results", [])
            elif isinstance(raw, list):
                courses = raw
            else:
                courses = []
        except Exception as exc:
            return _wrap_http_error(exc)
        _track_recommendations(session, [c.get("id") for c in courses if isinstance(c, dict) and "id" in c])
        return {
            "courses": courses,
            "count": len(courses),
            "query": query,
            "recommendations_used": session.recommendations_count,
        }

    @function_tool
    async def get_course_detail(course_id: str) -> dict:
        """Devuelve detalle completo de un curso (instructor, descripción, etc.)."""
        try:
            raw = await backend.get(f"/courses/{course_id}")
            # La API retorna { course: {...}, sections: [...] }
            if isinstance(raw, dict) and "course" in raw:
                course = raw["course"]
                sections = raw.get("sections", [])
                # Adjuntar secciones al curso para que el LLM pueda ver el contenido
                course["sections"] = sections
            else:
                course = raw
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 404:
                return {
                    "error": "not_found",
                    "user_message": "No encontré ese curso, ¿quieres que te muestre otras opciones?",
                }
            return _wrap_http_error(exc)
        except Exception as exc:
            return _wrap_http_error(exc)
        _track_recommendations(session, [course_id])
        return {"course": course}

    @function_tool
    async def get_course_lessons(course_id: str) -> dict:
        """Obtiene las lecciones de un curso. Requiere estar inscrito en el curso. Devuelve array vacío si no estás inscrito."""
        if not session.student_id:
            return {
                "error": "not_authenticated",
                "user_message": "Necesito tu email para verificar la inscripción.",
            }
        try:
            raw = await backend.get(
                f"/courses/{course_id}/lessons",
                params={"student_id": session.student_id},
            )
            # La API retorna { sections: [{..., lessons: [...]}] }
            if isinstance(raw, dict):
                sections = raw.get("sections", [])
            elif isinstance(raw, list):
                sections = raw
            else:
                sections = []
            # Aplanar lecciones de todas las secciones
            lessons = []
            for section in sections:
                section_lessons = section.get("lessons", [])
                for lesson in section_lessons:
                    lesson["section_title"] = section.get("title", "")
                    lessons.append(lesson)
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code in (401, 403):
                return {
                    "error": "not_enrolled",
                    "user_message": "Primero necesitas inscribirte en el curso para ver las lecciones.",
                }
            if exc.response.status_code == 404:
                return {
                    "error": "not_found",
                    "user_message": "No encontré ese curso.",
                }
            return _wrap_http_error(exc)
        except Exception as exc:
            return _wrap_http_error(exc)
        return {"lessons": lessons, "count": len(lessons)}

    @function_tool
    async def enroll_student(course_id: str, confirmed: bool) -> dict:
        """Inscribe al estudiante en un curso. SOLO debe llamarse con confirmed=true tras confirmación verbal explícita."""
        if not confirmed:
            return {
                "error": "not_confirmed",
                "user_message": "Necesito que el estudiante confirme verbalmente antes de inscribirlo.",
            }
        if not session.student_id:
            return {
                "error": "not_authenticated",
                "user_message": "Primero necesito el email del estudiante para inscribirlo.",
            }
        if course_id in session.enrolled_course_ids:
            return {
                "already_enrolled": True,
                "user_message": "El estudiante ya está inscrito en ese curso.",
            }

        try:
            result = await backend.post(
                f"/courses/{course_id}/enroll",
                body={"student_id": session.student_id},
            )
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 409:
                session.register_enrollment(course_id)
                return {
                    "already_enrolled": True,
                    "user_message": "El estudiante ya estaba inscrito en ese curso.",
                }
            if exc.response.status_code == 404:
                return {
                    "error": "course_not_found",
                    "user_message": "Ese curso no está disponible.",
                }
            if exc.response.status_code in (401, 403):
                return {
                    "error": "not_authenticated",
                    "user_message": "No pude verificar tu identidad. ¿Me confirmas tu email?",
                }
            return _wrap_http_error(exc)
        except Exception as exc:
            return _wrap_http_error(exc)

        session.register_enrollment(course_id)
        session.pending_enrollment = None

        # La API retorna { enrolled, lessonId, message } o { enrolled: false, checkoutUrl }
        if isinstance(result, dict):
            if result.get("enrolled"):
                return {
                    "enrolled": True,
                    "course_id": course_id,
                    "lesson_id": result.get("lessonId"),
                    "message": result.get("message", "Inscripción exitosa."),
                }
            if result.get("checkoutUrl"):
                return {
                    "enrolled": False,
                    "checkout_url": result["checkoutUrl"],
                    "message": result.get("message", "Curso de pago. Sigue el enlace de checkout."),
                }

        return {
            "enrolled": True,
            "course_id": course_id,
        }

    @function_tool
    async def lookup_student(email: str) -> dict:
        """Busca un estudiante por su email para verificar su identidad. Usa esto cuando el estudiante proporcione su email."""
        try:
            result = await backend.post("/student/lookup", body={"email": email})
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 404:
                return {
                    "found": False,
                    "user_message": "No encontré una cuenta con ese email. ¿Quieres que te siga ayudando sin verificar tu identidad?",
                }
            return _wrap_http_error(exc)
        except Exception as exc:
            return _wrap_http_error(exc)

        if isinstance(result, dict) and result.get("found"):
            student = result.get("student", {})
            session.email = email
            session.student_id = student.get("id")
            session.student_name = student.get("full_name")
            return {
                "found": True,
                "student_name": student.get("full_name", "Estudiante"),
                "student_id": student.get("id"),
            }

        return {
            "found": False,
            "user_message": "No encontré una cuenta con ese email.",
        }

    @function_tool
    async def escalate_to_advisor(reason: str, summary: str) -> dict:
        """Escala el caso a un asesor humano. Llamar ante reembolsos, problemas técnicos, reportes o convenios institucionales."""
        payload = {
            "reason": reason,
            "summary": summary,
            "student_email": session.email,
            "student_id": session.student_id,
            "student_name": session.student_name,
        }
        try:
            result = await backend.post("/escalations", body=payload)
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code in (401, 403):
                return {
                    "error": "not_authenticated",
                    "user_message": "No pude registrar el escalamiento automáticamente, pero un asesor humano te contactará.",
                }
            return _wrap_http_error(exc)
        except Exception:
            log.error("Escalation failed for reason=%s", reason)
            return {
                "error": "escalation_failed",
                "user_message": "No pude registrar el caso automáticamente, pero un asesor humano te contactará pronto.",
            }
        return {
            "escalated": True,
            "ticket_id": result.get("id"),
            "user_message": "Listo, un asesor humano se pondrá en contacto contigo pronto.",
        }

    return [
        get_courses,
        search_courses,
        get_course_detail,
        get_course_lessons,
        enroll_student,
        lookup_student,
        escalate_to_advisor,
    ]
