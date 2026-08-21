# TECH-001 — Refactorizar jerarquía de headings en lesson-sidebar

**Tipo:** Tech Debt (SEO + Accesibilidad)  
**Estado:** 📋 Backlog  
**Prioridad:** Medium  
**Estimación:** 1pt  
**Epic:** Estructura semántica HTML  
**Componente:** `src/components/layout/lesson-sidebar.tsx`

---

## Descripción

**Problema:** El archivo `lesson-sidebar.tsx` usa `<p>` con clase `font-medium` como heading de sección, en lugar de un elemento semántico `<h2>` o `<h3>`. Esto rompe:
- Jerarquía de headings para SEO
- Navegación de screen reader (usuarios no pueden "saltar" entre headings)
- Indexación en buscadores (página aparece sin estructura clara)

---

## Background

```tsx
// Línea 21 — ACTUAL (incorrecto)
<p className="font-medium">Contenido de la lección</p>
```

**Problemas:**
1. ❌ SEO: Buscadores no identifican esto como heading
2. ❌ a11y: Screen reader no lo marca como encabezado
3. ❌ Estructura visual engañosa (parece heading, pero no lo es semánticamente)

---

## Solución

Reemplazar `<p>` con `<h3>` (o `<h2>` si está al nivel correcto de la página):

```tsx
// DESPUÉS (correcto)
<h3 className="font-medium text-base">Contenido de la lección</h3>
```

---

## Notas técnicas

Antes de cambiar, **verificar la jerarquía completa de la página:**

- ¿Hay un `<h1>` en la página? (debe ser único)
- ¿Qué niveau está el layout padre? (¿h1, h2?)
- El sidebar debería ser `<h3>` si está dentro de una sección `<h2>`

---

## Criterios de Aceptación

- [ ] `lesson-sidebar.tsx` línea 21: cambiar `<p className="font-medium">` a `<h3>`
- [ ] Jerarquía de headings en la página es correcta (h1 > h2 > h3, sin saltos)
- [ ] Axe DevTools: 0 violations en "Headings require a logical order"
- [ ] Screen reader anuncia "Heading level 3: Contenido de la lección"
- [ ] Estilo CSS permanece igual (font-medium, tamaño, etc.)

---

## Testing

```bash
# Axe DevTools - verificar estructura de headings
npx axe-core src/components/layout/lesson-sidebar.tsx

# Chrome DevTools - Accessibility tree
# Devtools > Elements > Accessibility
# Verificar que h3 aparece en árbol de headings
```

### Manual
1. Abrir página que contiene lesson-sidebar
2. Usar screen reader (NVDA/VoiceOver)
3. Navegar con `H` key (NVDA) o `Control+Option+Command+H` (VoiceOver)
4. Verificar que "Contenido de la lección" aparece como heading nivel 3

---

## Impacto

- **SEO:** Mejora indexación (Google entiende estructura de página)
- **a11y:** Navegación más fácil para usuarios ciegos
- **Código:** No requiere cambios funcionales, solo semántica HTML
- **Performance:** Sin impacto en performance

---

## Estimación

**1pt** — Cambio trivial (reemplazar elemento, mantener estilos)

---

## Checklist

- [ ] Cambiar `<p>` a `<h3>` en lesson-sidebar.tsx
- [ ] Verificar que no se rompe layout/estilos
- [ ] Axe test pasando
- [ ] Screen reader anuncia correctamente
- [ ] Revisar si hay otros `<p>` usado como headings en el proyecto

---

## Refactorización futura

Si hay otros `<p>` usados como headings en el proyecto, considerar:
- [ ] Audit completo de estructura semántica
- [ ] Crear lint rule para detectar este patrón
- [ ] Documentar en style guide: "Siempre usar h1-h6 para headings"

---

**Creado:** 2026-08-17  
**Asignado a:** [Frontend]  
**Bloqueado por:** —  
**Bloquea:** —  
**Prioridad:** Low (no es bloqueante, pero deseable)
