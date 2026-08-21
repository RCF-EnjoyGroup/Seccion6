# Índice de Documentación — Auditoría Tech Lead

**Proyecto:** EduPlatform-ASB  
**Auditoría:** Accesibilidad (a11y) + SEO Técnico  
**Fecha:** 2026-08-17  
**Ubicación:** `docs/`

---

## 📋 Documentos disponibles

### 🔍 Documentos Principales

1. **[audit-findings-classification.md](audit-findings-classification.md)** ← EMPEZAR AQUÍ
   - Clasificación de todos los hallazgos (6 FIX + 1 HU + 1 TECH-DEBT)
   - Severidades y estimaciones
   - Plan de acción por sprint
   - Métricas de calidad

2. **[roadmap-a11y.md](roadmap-a11y.md)** ← PARA PLANNING
   - Timeline de trabajo
   - Asignaciones propuestas
   - Métricas de éxito
   - Impacto de negocio

---

## 🐛 FIX — Bugs Corregidos (7 documentos) ✅

**Total Estimación:** 7pt  
**Severidad:** 5 bloqueantes + 1 importante + 1 importante  
**Timeline:** Completado este sprint

| ID | Archivo | Estimación | Componente | Acciones | Estado |
|----|---------|-----------|-----------|----------|--------|
| **FIX-001** | [FIX-001-course-filters-label.md](fixes/FIX-001-course-filters-label.md) | 1pt | `catalog/course-filters.tsx` | Agregar `<Label>` a input de búsqueda | ✅ Done |
| **FIX-002** | [FIX-002-review-form-label.md](fixes/FIX-002-review-form-label.md) | 1pt | `courses/review-form.tsx` | Agregar `<Label>` a textarea | ✅ Done |
| **FIX-003** | [FIX-003-review-list-avatar-alt.md](fixes/FIX-003-review-list-avatar-alt.md) | 1pt | `courses/review-list.tsx` | Agregar `alt` a `<AvatarImage>` | ✅ Done |
| **FIX-004** | [FIX-004-quiz-options-labels.md](fixes/FIX-004-quiz-options-labels.md) | 2pt | `dashboard/quiz-questions-editor.tsx` | Agregar `<Label>` en loop de inputs | ✅ Done |
| **FIX-005** | [FIX-005-live-simulator-button-label.md](fixes/FIX-005-live-simulator-button-label.md) | 1pt | `landing/live-simulator.tsx` | Agregar `aria-label` a botón play/pause | ✅ Done |
| **FIX-006** | [FIX-006-video-player-title.md](fixes/FIX-006-video-player-title.md) | 1pt | `player/video-player.tsx` | Agregar `title` + `aria-label` al `<video>` | ✅ Done |
| **FIX-007** | [FIX-007-mark-complete-status.md](fixes/FIX-007-mark-complete-status.md) | 1pt | `player/mark-complete-button.tsx` | Agregar `role="status"` + `aria-live="polite"` | ✅ Done |

---

## 📝 HU — Historias de Usuario (1 documento)

**Total Estimación:** 2pt  
**Prioridad:** Medium  
**Timeline:** Siguiente sprint

| ID | Archivo | Estimación | Epicomponente | Descripción |
|----|---------|-----------|----------------|-------------|
| **HU-001** | [HU-001-accessible-color-indicator.md](user-stories/HU-001-accessible-color-indicator.md) | 2pt | Accesibilidad & WCAG | Indicadores de estado con color + ícono/patrón para usuarios daltonismo |

---

## 🔧 TECH-DEBT — Deuda Técnica (1 documento)

**Total Estimación:** 1pt  
**Prioridad:** Low  
**Timeline:** Backlog

| ID | Archivo | Estimación | Componente | Descripción |
|----|---------|-----------|-----------|-------------|
| **TECH-001** | [TECH-001-lesson-sidebar-headings.md](tech-debt/TECH-001-lesson-sidebar-headings.md) | 1pt | `layout/lesson-sidebar.tsx` | Cambiar `<p>` a `<h3>` para mantener jerarquía de headings |

---

## 🎯 Cómo usar esta documentación

### Para el Tech Lead
1. Leer [audit-findings-classification.md](audit-findings-classification.md)
2. Revisar cada FIX (los 7 documentos)
3. Presentar roadmap al equipo

### Para el Product Owner
1. Leer resumen en [roadmap-a11y.md](roadmap-a11y.md)
2. Validar prioridades y estimaciones
3. Agregar HU-001 al backlog

### Para Frontend Developer
1. Seleccionar un FIX desde [audit-findings-classification.md](audit-findings-classification.md)
2. Leer documentación específica del FIX (ej: [FIX-001-course-filters-label.md](fixes/FIX-001-course-filters-label.md))
3. Implementar según "Solución" indicada
4. Verificar con testing (axe, screen reader)
5. Crear PR

### Para QA / Testing
1. Leer criterios de aceptación en cada FIX
2. Usar axe DevTools para verificar
3. Testing manual con screen reader (NVDA/JAWS/VoiceOver)
4. Documentar resultados en PR

---

## 📊 Clasificación Rápida

### Por Severidad

**⛔ Bloqueantes (5)** — **Corregidos**
- FIX-001: Input sin label ✅
- FIX-002: Textarea sin label ✅
- FIX-003: Imagen sin alt (avatar) ✅
- FIX-004: Inputs en quiz sin labels (múltiple) ✅
- FIX-005: Botón sin aria-label ✅

**⚠️ Importantes (2)** — **Corregidos**
- FIX-006: Video sin title/aria-label ✅
- FIX-007: Información sin role="status" ✅

**🟡 Otros (2)** — Pendientes / Backlog
- HU-001: Colores más accesibles (feature)
- TECH-001: Jerarquía de headings (refactorización)

---

### Por Criterio (WCAG 2.1)

**Accesibilidad (a11y)**
- A1 (Imágenes): FIX-003
- A2 (Botones/Labels): FIX-005, FIX-006
- A3 (Inputs): FIX-001, FIX-002, FIX-004
- A4 (ARIA): FIX-007
- A6 (Contraste): HU-001

**SEO Técnico**
- B2 (Imágenes alt): FIX-003
- B3 (Headings): TECH-001

---

### Por Componente

| Componente | Archivos afectados | Estimación |
|-----------|-------------------|-----------|
| `catalog/course-filters.tsx` | FIX-001 | 1pt |
| `courses/review-form.tsx` | FIX-002 | 1pt |
| `courses/review-list.tsx` | FIX-003 | 1pt |
| `dashboard/quiz-questions-editor.tsx` | FIX-004 | 2pt |
| `landing/live-simulator.tsx` | FIX-005, HU-001 | 3pt |
| `layout/lesson-sidebar.tsx` | TECH-001 | 1pt |
| `player/mark-complete-button.tsx` | FIX-007 | 1pt |
| `player/video-player.tsx` | FIX-006 | 1pt |

---

## 🚀 Próximos Pasos

1. ✅ Auditoría completada (2026-08-17)
2. ✅ **Validar clasificación** (Tech Lead + Product Owner)
3. ✅ **Priorizar y estimar** (Sprint Planning)
4. ✅ **Asignar a developers** (Team Leads)
5. ✅ **Ejecutar en sprint** (Development) — **COMPLETADO**
6. ⏳ **Testing y QA** (QA Team)
7. ⏳ **Deployment** (DevOps)
8. ⏳ **Auditoría de seguimiento** (2–4 semanas después)

---

## 📌 Notas importantes

- **Todos los FIX son técnicamente triviales** (1-2 horas cada uno)
- **Sin dependencias de backend** — Frontend-only changes
- **Impacto alto de negocio** — Cumplimiento legal + SEO + a11y
- **Testing esencial** — Usar axe DevTools + screen readers
- **Documentación preventiva** — Estos documentos sirven para futuro (style guide, CI/CD rules)

---

## 🔗 Referencias externas

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Axe DevTools](https://www.deque.com/axe/devtools/)
- [Tailwind a11y](https://tailwindcss.com/docs/accessibility)
- [Next.js Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)

---

## 👤 Contacto / Dudas

Para dudas sobre:
- **Auditoría / Criterios:** Consultar [audit-findings-classification.md](audit-findings-classification.md)
- **Un FIX específico:** Leer documento del FIX correspondiente
- **Timeline / Priorización:** Ver [roadmap-a11y.md](roadmap-a11y.md)
- **WCAG 2.1:** Consultar referencias externas

---

**Documento Índice v2.0**  
**Generado:** 2026-08-17  
**Actualizado:** 2026-08-17 (fixes implementados)  
**Próxima revisión:** Al completar testing QA y deployment
