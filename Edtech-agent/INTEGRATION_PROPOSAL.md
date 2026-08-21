# Propuesta de Integración: Edy Widget en el SaaS

**Resumen ejecutivo:** Integrar Edy, un asistente de voz IA en español, como widget embebible en cualquier página del SaaS EdTech. Los estudiantes pueden explorar cursos, inscribirse y resolver dudas **sin salir de la plataforma**.

---

## 1. ¿Qué es Edy?

- **Asistente de voz** en español que ayuda a estudiantes a:
  - Explorar catálogo de cursos
  - Obtener detalles de cursos específicos
  - Inscribirse en cursos
  - Ver lecciones de cursos inscritos
  - Escalar problemas a asesores humanos
- **Stack:** Python (LiveKit Agents) + AWS (Bedrock LLM + Polly TTS + Transcribe STT)
- **Estado:** Funcional, testeado, conectado a tu backend en `http://localhost:3001`

---

## 2. Opciones de Integración

### **Opción A: Web Component (Recomendado)**

Edy se embebe como un elemento HTML reutilizable:

```html
<!-- En cualquier página del SaaS -->
<edy-voice-widget 
  livekit-url="wss://tu-proyecto.livekit.cloud"
  api-key="tu-api-key"
  api-secret="tu-api-secret"
  room="edtech-saas-widget"
  backend-url="http://localhost:3001">
</edy-voice-widget>

<script src="/assets/edy-widget.js"></script>
```

**Ventajas:**
- ✅ Integración limpia, sin iframe
- ✅ Funciona con React, Vue, vanilla JS
- ✅ Reutilizable en múltiples páginas
- ✅ Bajo acoplamiento

**Pasos de implementación:**
1. Crear `edy-widget.js` (Web Component que carga LiveKit client)
2. Crear UI mínima: botón flotante + modal de voz/chat
3. Exponer credenciales LiveKit de forma segura (tokens firmados)
4. Conectar a sala con nombre único por estudiante (ej: `edy-student-{userId}`)

**Tiempo estimado:** 2-3 horas

---

### **Opción B: Chat REST + Audio (Alternativa)**

Si no quieres WebRTC en el navegador, endpoint REST que:

```javascript
POST /api/edy/chat
{
  "user_id": "123",
  "message": "Quiero ver cursos de Python"
}
→
{
  "response": "Encontré 3 cursos...",
  "audio_url": "https://..."
}
```

**Ventajas:**
- ✅ Más simple, sin WebRTC
- ✅ Mejor compatibilidad con navegadores viejos
- ✅ Fácil de monitorear (logs de todas las queries)

**Pasos de implementación:**
1. Crear endpoint REST en tu backend que llame al agente Edy
2. Crear chat UI simple (HTML + Fetch API)
3. Reproducir audio de respuesta con `<audio>`

**Tiempo estimado:** 1.5-2 horas

---

## 3. Flujo de Usuario (Caso de Uso)

**Escenario: Estudiante en página de "Mi Progreso"**

1. Ve botón flotante: "Habla con Edy"
2. Hace clic → abre widget con micrófono
3. Dice: *"Quiero ver cursos de Python"*
4. Edy (voz Polly Lupe en español):
   - Llama `GET /api/courses` a tu backend
   - Lee en voz alta: *"Encontré 2 cursos de Python: 'Deep Learning' por $99 y 'Python Avanzado' por $79. ¿Cuál te interesa?"*
5. Estudiante: *"El primero"*
6. Edy llama `GET /api/courses/{id}` y da detalles
7. Estudiante: *"Quiero inscribirme"*
8. Edy pide confirmación: *"¿Confirmas que quieres inscribirte en Deep Learning por $99?"*
9. Estudiante: *"Sí"*
10. Edy llama `POST /api/courses/{id}/enroll` → inscrito ✅

---

## 4. API Endpoints que Edy Usa

Tu backend **ya tiene estos endpoints**. Edy los llamará automáticamente:

| Endpoint | Método | Qué hace |
|---|---|---|
| `/api/courses` | GET | Lista cursos (con filtro por categoría) |
| `/api/courses/{id}` | GET | Detalle de un curso |
| `/api/courses/{id}/lessons` | GET | Lecciones (requiere estar inscrito) |
| `/api/courses/{id}/enroll` | POST | Inscribir estudiante |
| `/api/escalations` | POST | Crear escalamiento a asesor |

**No hay que cambiar nada** — Edy habla con tu API actual.

---

## 5. Credenciales Requeridas

Para integrar Edy en el SaaS necesitas:

```env
# LiveKit (ya tienes)
LIVEKIT_URL=wss://tu-proyecto.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...

# AWS Bedrock + Polly + Transcribe (ya tienes)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1

# Nuevo: Exposer de credenciales seguras al cliente
# (generar tokens firmados con expiración)
```

---

## 6. Diagrama de Arquitectura

```
┌─────────────────────────────────────┐
│       SaaS Frontend                 │
│  (React / Vue / Vanilla JS)         │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ Edy Widget (Web Component)   │   │
│  │ - Micrófono + parlante       │   │
│  │ - UI mínima (botón flotante) │   │
│  └──────────────────────────────┘   │
└──────────────────┬──────────────────┘
                   │ WebRTC (audio)
                   ▼
┌─────────────────────────────────────┐
│     LiveKit Cloud / Self-hosted      │
│  (conexión de voz en tiempo real)    │
└──────────────────┬──────────────────┘
                   │ signaling
                   ▼
┌─────────────────────────────────────┐
│   Edy Agent (Python LiveKit)         │
│  - VAD (Silero)                     │
│  - STT (AWS Transcribe)             │
│  - LLM (Bedrock Sonnet/Haiku)       │
│  - TTS (Polly Lupe)                 │
└──────────────────┬──────────────────┘
                   │ HTTP
                   ▼
        ┌──────────────────────┐
        │   Backend SaaS       │
        │  (Node.js / tu repo) │
        │  /api/courses        │
        │  /api/*/enroll       │
        │  /api/escalations    │
        └──────────────────────┘
```

---

## 7. Checklist de Implementación

### Backend (Node.js / tu repo)
- [ ] Verificar que los 5 endpoints funcionan (GET /api/courses, etc.)
- [ ] Agregar CORS headers si Edy agent lo necesita
- [ ] (Opcional) Crear endpoint `/api/edy/health` para monitoreo

### Frontend (SaaS)
- [ ] Crear `edy-widget.js` (Web Component)
- [ ] Crear UI: botón flotante + modal
- [ ] Generar tokens LiveKit seguros en el backend
- [ ] Embed en página (ej: dashboard, explorador de cursos)
- [ ] Testar en navegadores modernos

### Infraestructura
- [ ] Asegurar que Edy agent esté corriendo (puede ser en mismo servidor que backend)
- [ ] Configurar credenciales AWS en CI/CD
- [ ] Monitoreo de logs de Edy (para debugear conversaciones)

---

## 8. Estimación de Tiempo

| Tarea | Horas |
|---|---|
| Crear Web Component + UI | 2-3 |
| Integrar en SaaS (1-2 páginas) | 1-2 |
| Testar + debugging | 1-2 |
| **Total** | **4-7 horas** |

---

## 9. Próximos Pasos

1. **Elegir opción:** Web Component (A) o REST Chat (B)
2. **Briefing técnico:** Compartir este doc con el agente que integrará
3. **Mocks de UI:** Diseñar cómo se ve el widget en la página
4. **Credenciales:** Decidir cómo pasan LIVEKIT_* de forma segura al cliente
5. **Testing:** QA en la conversación Edy + backend

---

## 10. Contacto & Repositorio

- **Código Edy:** `c:\Users\Jeff\Desktop\Edtech-agent\`
- **Archivos clave:**
  - [main.py](main.py) — agente voz
  - [tools.py](tools.py) — integración con endpoints
  - [backend_client.py](backend_client.py) — HTTP client
  - [README.md](README.md) — instrucciones de instalación

- **Demo en vivo:** Disponible en meet.livekit.io (sala `edtech-test`)

---

**¿Listo para integrar? Comparte este doc con el agente frontend.** 🚀
