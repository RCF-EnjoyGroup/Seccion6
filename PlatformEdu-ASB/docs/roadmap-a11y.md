# Roadmap de Accesibilidad — EduPlatform

**Fecha:** 2026-08-17  
**Fuente:** Tech Lead Audit  
**Estado:** 📋 Planificación  

---

## 📊 Resumen Ejecutivo

| Categoría | Cantidad | Story Points | Timeline |
|-----------|----------|--------------|----------|
| **FIX — Bloqueantes** | 5 | 5pt | 🔴 THIS SPRINT |
| **FIX — Importantes** | 1 | 1pt | 🔴 THIS SPRINT |
| **HU — Features** | 1 | 2pt | 🟠 NEXT SPRINT |
| **TECH-DEBT** | 1 | 1pt | 🟡 BACKLOG |
| **TOTAL** | **8** | **9pt** | — |

---

## 🔴 SPRINT ACTUAL (Bloqueantes + Importantes) — 6pt

### Commits esperados
```
commit: fix(a11y): Add label to course search input (FIX-001)
commit: fix(a11y): Add label to review textarea (FIX-002)
commit: fix(a11y): Add alt text to review avatars (FIX-003)
commit: fix(a11y): Add labels to quiz option inputs (FIX-004)
commit: fix(a11y): Add aria-label to play/pause button (FIX-005)
commit: fix(a11y): Add title to video player (FIX-006)
commit: fix(a11y): Add role=status to mark complete indicator (FIX-007)
```

### Asignaciones propuestas
- **Frontend Lead:** FIX-001, FIX-002, FIX-003 (3pt — fáciles)
- **Frontend Mid:** FIX-004 (2pt — loop + labels)
- **Frontend Junior:** FIX-005, FIX-006 (2pt — simple)
- **Frontend/QA:** FIX-007 (1pt — media)

### Tiempo estimado
- Desarrollo: ~6-8 horas
- Code review: ~1-2 horas
- Testing (axe + screen reader): ~2-3 horas
- **Total:** 1-1.5 días (1 developer)

---

## 🟠 SIGUIENTE SPRINT (HU + TECH-DEBT) — 3pt

### HU-001: Indicadores de estado accesibles
**Estimación:** 2pt  
**Bloqueado por:** Diseño en Figma  
**Dpendes on:** —

**Tareas:**
1. [ ] UX/Design: Mockups en Figma (estados: conectado, desconectado, conectando)
2. [ ] Frontend: Crear `<ConnectionStatusIndicator>` reutilizable
3. [ ] QA: Testing con usuarios daltonismo
4. [ ] Deployment: Verificar en staging

### TECH-001: Refactorizar headings
**Estimación:** 1pt  
**Bloqueado por:** —  
**Depende on:** —

**Tarea:**
1. [ ] Frontend: Cambiar `<p>` a `<h3>` en lesson-sidebar
2. [ ] Testing: Axe + screen reader
3. [ ] Code review
4. [ ] Merge a main

---

## 📈 Métricas de éxito

Después de completar roadmap:

| Métrica | Before | After | Target |
|---------|--------|-------|--------|
| Componentes sin a11y issues | 42/49 | 49/49 | 100% |
| WCAG 2.1 AA violations | 5 | 0 | 0 |
| Screen reader friendly | 85% | 95%+ | 95%+ |
| SEO issues (headings) | 1 | 0 | 0 |
| Axe violations (Critical) | 0 | 0 | 0 |

---

## 🚀 Impacto de Negocio

### SEO
- ✅ Estructura de página clara para Google
- ✅ Imágenes indexables (avatars con alt)
- ✅ Mejor rank en búsquedas educativas

### Accesibilidad
- ✅ Cumple WCAG 2.1 AA (requerimiento legal en muchos países)
- ✅ Acceso para ~15% de población con deficiencias visuales
- ✅ Reduce riesgo legal (demandas por a11y son comunes en EdTech)

### UX
- ✅ Mejor experiencia para TODOS (not just disabled)
- ✅ Navegación con teclado más clara
- ✅ Mejor en slow networks (aria-labels < imágenes grandes)

---

## 📁 Documentación

Todos los documentos están en `docs/`:

```
docs/
├── audit-findings-classification.md          ← Resumen general
├── roadmap-a11y.md                           ← Este archivo
├── fixes/
│   ├── FIX-001-course-filters-label.md
│   ├── FIX-002-review-form-label.md
│   ├── FIX-003-review-list-avatar-alt.md
│   ├── FIX-004-quiz-options-labels.md
│   ├── FIX-005-live-simulator-button-label.md
│   ├── FIX-006-video-player-title.md
│   └── FIX-007-mark-complete-status.md
├── user-stories/
│   └── HU-001-accessible-color-indicator.md
└── tech-debt/
    └── TECH-001-lesson-sidebar-headings.md
```

---

## 🎯 Definición de Done (por categoría)

### FIX (Bugs)
- [ ] Código pushado a `main`
- [ ] Tests pasando (unit + e2e si aplica)
- [ ] Axe DevTools: 0 violations
- [ ] Screen reader test OK (manual)
- [ ] Code review aprobado
- [ ] PR merged

### HU (Features)
- [ ] Criterios de aceptación implementados
- [ ] Diseño en Figma aprobado
- [ ] Code review
- [ ] Tests (unit + integration)
- [ ] Deployed a staging
- [ ] Monitoreado en producción

### TECH-DEBT
- [ ] Refactorización completada
- [ ] No regresiones funcionales
- [ ] Tests pasando
- [ ] Code review

---

## 🔔 Comunicación

### Al equipo
> "Tenemos 8 hallazgos de accesibilidad de los que 5 son bloqueantes. Esto requiere 1 sprint (8pt). Impacto: cumplir WCAG 2.1 AA, mejor SEO, y acceso para usuarios con deficiencias visuales."

### Al cliente/stakeholders
> "Auditoría de accesibilidad completada. Encontramos issues que limitan acceso a ~15% de población. Plan de remediación en 2 sprints (HU + fixes). Inversión pequeña, retorno alto en SEO + cumplimiento legal."

---

## ⚠️ Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|-----------|
| Fixes rompen otro componente | Media | Bajo | Tests de regresión before merge |
| Screen reader compatibility | Baja | Medio | Testing en NVDA + JAWS + VoiceOver |
| Diseño HU-001 rechazado | Media | Bajo | Iteración rápida en Figma |

---

## 📞 Contactos

- **Tech Lead:** [Responsable de auditoría]
- **Frontend Lead:** [Responsable de fixes]
- **Product Owner:** [Responsable de priorización]
- **QA/Testing:** [Responsable de a11y testing]

---

**Versión:** 1.0  
**Última actualización:** 2026-08-17  
**Siguiente review:** Cuando se completen los FIX (fin de sprint)
