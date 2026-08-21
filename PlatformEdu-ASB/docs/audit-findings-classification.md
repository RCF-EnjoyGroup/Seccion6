# Clasificación de Hallazgos — Auditoría Tech Lead

**Fecha:** 2026-08-17  
**Auditoría:** Accesibilidad (a11y) + SEO Técnico  
**Proyecto:** EduPlatform-ASB  
**Total Hallazgos:** 8

---

## 📊 Resumen Ejecutivo

| Categoría | Cantidad | Estado |
|-----------|----------|--------|
| **FIX** (Bugs a corregir) | 6 | ⛔ Bloqueante (5) + ⚠️ Importante (1) |
| **HU** (Historias de Usuario) | 1 | 📋 Nueva funcionalidad |
| **OTROS** (Tech Debt) | 1 | 🔧 Deuda técnica |
| **Total** | **8** | — |

---

## 🐛 FIX — Bugs / Defectos a Corregir (6)

Problemas existentes que rompen funcionalidad o violan estándares (WCAG 2.1, SEO).

### FIX-001 ⛔ BLOCKING — Input de búsqueda sin Label

**Archivo:** `src/components/catalog/course-filters.tsx`  
**Línea(s):** 68  
**Severidad:** Blocking (A3 - Input sin label)  
**Impacto:** Usuarios de lector de pantalla no saben qué hace el input

#### Problema
```tsx
<Input
  placeholder="Buscar cursos..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```
El input no tiene `<label>` asociado ni `aria-label`. Placeholder NO sustituye un label.

#### Solución
Agregar `<label>` con `htmlFor` que apunte al `id` del input, o bien `aria-label`.

#### Técnica
- Frontend: `src/components/catalog/course-filters.tsx`
- Componentes: `<Input>`, `<Label>`
- Tiempo estimado: 15 min
- Testing: Verificar con axe DevTools / screen reader

---

### FIX-002 ⛔ BLOCKING — Textarea de reseña sin Label

**Archivo:** `src/components/courses/review-form.tsx`  
**Línea(s):** 35  
**Severidad:** Blocking (A3 - Textarea sin label)  
**Impacto:** Violación WCAG 2.1 Level A

#### Problema
```tsx
<Textarea
  name="comment"
  placeholder="¿Qué te pareció el curso? (opcional)"
  defaultValue={existingReview?.comment ?? ""}
  rows={3}
/>
```
Textarea sin `<label>` asociado.

#### Solución
Envolver con `<label htmlFor="comment">` o agregar `aria-label`.

#### Técnica
- Frontend: `src/components/courses/review-form.tsx`
- Componentes: `<Textarea>`, `<Label>`
- Tiempo estimado: 10 min

---

### FIX-003 ⛔ BLOCKING — Imagen de avatar sin alt

**Archivo:** `src/components/courses/review-list.tsx`  
**Línea(s):** 36–38  
**Severidad:** Blocking (A1 - Imagen sin alt / B2 - SEO)  
**Impacto:** 
- a11y: Usuarios ciegos no saben qué es la imagen
- SEO: Imagen de usuario no aparece en búsqueda de imágenes

#### Problema
```tsx
<AvatarImage src={review.student?.avatar_url ?? undefined} />
```
`<AvatarImage>` es un wrapper de `<img>` (de Radix UI) que requiere `alt` obligatorio.

#### Solución
Agregar prop `alt="Avatar de {nombre del estudiante}"` a `<AvatarImage>`.

#### Técnica
- Frontend: `src/components/courses/review-list.tsx`
- Componentes: `<Avatar>`, `<AvatarImage>`
- Tiempo estimado: 5 min

---

### FIX-004 ⛔ BLOCKING — Inputs de opciones de quiz sin Label (Múltiple)

**Archivo:** `src/components/dashboard/quiz-questions-editor.tsx`  
**Línea(s):** 62–82  
**Severidad:** Blocking (A3 - Input sin label, múltiples instancias)  
**Impacto:** Formulario inusable con screen reader

#### Problema
```tsx
{lesson.options.map((option, index) => (
  <Input
    key={index}
    placeholder={`Opción ${index + 1}`}
    value={option}
    onChange={(e) => updateOption(index, e.target.value)}
  />
))}
```
Loop de inputs sin labels individuales. El placeholder no es accesible.

#### Solución
Agregar `<label>` para cada opción o `aria-label={`Opción ${index + 1}`}`.

#### Técnica
- Frontend: `src/components/dashboard/quiz-questions-editor.tsx`
- Componentes: `<Input>`, `<Label>` (en loop)
- Tiempo estimado: 20 min
- Nota: Considerar refactorizar en componente `<QuizOptionInput>` reutilizable

---

### FIX-005 ⛔ BLOCKING — Botón play/pause sin aria-label

**Archivo:** `src/components/landing/live-simulator.tsx`  
**Línea(s):** 107  
**Severidad:** Blocking (A2 - Botón sin label accesible)  
**Impacto:** Usuarios con lector de pantalla no saben qué hace el botón

#### Problema
```tsx
<button
  onClick={() => setIsPlaying(!isPlaying)}
  className="text-muted-foreground hover:text-foreground transition-colors"
>
  {isPlaying ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
</button>
```
Botón con solo ícono, sin `aria-label` ni texto accesible.

#### Solución
Agregar `aria-label={isPlaying ? "Pausar" : "Reproducir"}`.

#### Técnica
- Frontend: `src/components/landing/live-simulator.tsx`
- Tiempo estimado: 5 min

---

### FIX-006 ⛔ BLOCKING — Elemento video sin identificación accesible

**Archivo:** `src/components/player/video-player.tsx`  
**Línea(s):** 7  
**Severidad:** Blocking (A2 - Video sin title/aria-label)  
**Impacto:** Screen reader no puede identificar el elemento

#### Problema
```tsx
<video
  ref={videoRef}
  src={videoUrl}
  controls
  className="w-full h-full bg-black"
/>
```
`<video>` sin `title`, `aria-label`, ni descripción accesible.

#### Solución
Agregar `title="Reproductor de video de lección: {lección.title}"` y/o `aria-label`.

#### Técnica
- Frontend: `src/components/player/video-player.tsx`
- Tiempo estimado: 5 min

---

### FIX-007 ⚠️ IMPORTANT — Información de "Lección completada" sin semántica

**Archivo:** `src/components/player/mark-complete-button.tsx`  
**Línea(s):** 14–16  
**Severidad:** Important (A4 - Roles ARIA)  
**Impacto:** Lectores de pantalla no anuncian cambio de estado

#### Problema
```tsx
<div className="flex items-center gap-2">
  <CheckCircle2 size={20} className="text-green-500" />
  <span>Lección completada</span>
</div>
```
Información crítica en `<div>` genérico. Debería tener `role="status"` y `aria-live="polite"` para que screen reader anuncie el cambio.

#### Solución
Cambiar a `<div role="status" aria-live="polite">` o usar `<output>`.

#### Técnica
- Frontend: `src/components/player/mark-complete-button.tsx`
- Tiempo estimado: 10 min

---

## 📋 HU — Historias de Usuario / Nuevas Funcionalidades (1)

Requisitos nuevos o mejoras que no existen aún. Deben formalizarse como historias en backlog.

### HU-001 — Mejorar accesibilidad visual de elementos decorativos

**Archivo:** `src/components/landing/live-simulator.tsx`  
**Línea(s):** 87–89  
**Severidad:** Important (A6 - Contraste / Accesibilidad visual)  
**Categoría:** Feature (a11y improvement)  
**Epic:** Accesibilidad & WCAG Compliance

#### Descripción
Actualmente, los círculos decorativos de live-simulator usan solo color para transmitir información (rojo/verde/amarillo). Usuarios con deficiencia de color rojo-verde no pueden distinguir estados.

#### Requisito
Agregar patrones, iconos, o texto alternativo además de color para indicar estados de conexión (conectado, desconectado, conectando).

#### Impacto
- a11y: Cumple WCAG 2.1 AA para "Color Not the Only Means"
- UX: Mejora para todos los usuarios, no solo con deficiencia de color

#### Componente
`<div className="w-3 h-3 rounded-full bg-{color} animate-pulse" />`

#### Propuesta
- Agregar ícono adicional o patrón SVG
- Agregar texto accesible "Estado: Conectado" (visualmente oculto con sr-only)
- Usar `aria-label` en el indicador

#### Técnica
- Frontend: `src/components/landing/live-simulator.tsx`
- Estimación: 2pt
- Componentes: Posible crear `<ConnectionStatusIndicator>` reutilizable

#### Criterios de Aceptación (Propuesta)
- [ ] Indicador visual tiene 2+ maneras de indicar estado (color + patrón/ícono/texto)
- [ ] Test WCAG AA: color contrast ≥ 3:1
- [ ] Screen reader anuncia estado correctamente
- [ ] Responsive en mobile

---

## 🔧 OTROS — Tech Debt / Refactorización (1)

Mejoras técnicas, deuda técnica, o tareas que no son bugs funcionales.

### TECH-001 — Refactorizar jerarquía de headings en lesson-sidebar

**Archivo:** `src/components/layout/lesson-sidebar.tsx`  
**Línea(s):** 21  
**Severidad:** Important (B3 - Jerarquía de headings)  
**Categoría:** Tech Debt (SEO + a11y)  
**Epic:** Estructura semántica HTML

#### Problema
```tsx
<p className="font-medium">Contenido de la lección</p>
```
Usado como heading de sección, pero es un `<p>`. Rompe jerarquía de headings para:
- Screen readers: no identifica como heading
- SEO: buscadores no indexan estructura de página correctamente

#### Solución
Reemplazar con `<h3>` o `<h2>` según contexto (jerarquía de la página).

#### Impacto
- SEO: Mejora indexación y estructura visible para search engines
- a11y: Screen reader navigation es más clara (usuarios pueden saltar entre headings)

#### Técnica
- Frontend: `src/components/layout/lesson-sidebar.tsx`
- Estimación: 1pt (trivial)
- Testing: Verificar headings con axe DevTools / web inspector

#### Notas
Revisar la página completa (parent layout) para asegurar jerarquía consistente (h1 > h2 > h3 sin saltos).

---

## 📈 Plan de Acción

### Sprint Actual (Inmediato) — FIX BLOQUEANTES

**Prioridad:** Critical | **Estimación Total:** 8pt | **Timeline:** 1 sprint (2 semanas)

| ID | Archivo | Estimación | Asignado | Status |
|----|---------|-----------|----------|--------|
| FIX-001 | course-filters.tsx | 1pt | Frontend | ⏳ To Do |
| FIX-002 | review-form.tsx | 1pt | Frontend | ⏳ To Do |
| FIX-003 | review-list.tsx | 1pt | Frontend | ⏳ To Do |
| FIX-004 | quiz-questions-editor.tsx | 2pt | Frontend | ⏳ To Do |
| FIX-005 | live-simulator.tsx | 1pt | Frontend | ⏳ To Do |
| FIX-006 | video-player.tsx | 1pt | Frontend | ⏳ To Do |
| FIX-007 | mark-complete-button.tsx | 1pt | Frontend | ⏳ To Do |

**Total:** 8pt (1 sprint)

### Siguiente Sprint (2–3 semanas)

| ID | Categoría | Estimación | Estado |
|----|-----------|-----------|--------|
| HU-001 | Feature (a11y) | 2pt | 📋 Backlog |
| TECH-001 | Tech Debt | 1pt | 📋 Backlog |

---

## 📁 Salida esperada en `docs/`

```
docs/
├── audit-findings-classification.md (este archivo)
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
├── tech-debt/
│   └── TECH-001-lesson-sidebar-headings.md
└── roadmap-a11y.md
```

---

## 🎯 Métricas de Calidad

- **Cobertura de a11y:** 7/49 componentes auditados → **14% con hallazgos**
- **Hallazgos bloqueantes:** 5 (62.5% del total)
- **Hallazgos WCAG 2.1 críticos:** 6 (75%)
- **Estimación para fix total:** 8pt (1 sprint)
- **Riesgo SEO:** 1 hallazgo (impacto bajo-medio)

---

## ✅ Próximos pasos

1. **Revisar y validar** esta clasificación con Tech Lead + Product Owner
2. **Crear tareas** en Jira/Linear basadas en FIX y HU
3. **Estimar** HU-001 y TECH-001 en refinamiento de backlog
4. **Asignar** FIX-001 a FIX-007 para el sprint actual
5. **Ejecutar** fixes en orden de severidad (bloqueante → importante)
6. **Verificar** con axe DevTools + screen reader tras cada fix
7. **Documentar** decisiones de diseño en cada fix commit

---

**Documento generado:** 2026-08-17  
**Auditoría realizada por:** Tech Lead Skill  
**Validado por:** [Pendiente]
