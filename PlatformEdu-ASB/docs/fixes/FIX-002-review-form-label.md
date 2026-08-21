# FIX-002 — Textarea de reseña sin Label (Accesibilidad)

**Estado:** ✅ Done  
**Severidad:** ⛔ Blocking  
**Criterio:** A3 (Textarea sin label asociado)  
**Estimación:** 1pt (~10 min)  
**Componente:** `src/components/courses/review-form.tsx`

---

## Problema

```tsx
// Línea 35 — ANTES (incorrecto)
<Textarea
  name="comment"
  placeholder="¿Qué te pareció el curso? (opcional)"
  defaultValue={existingReview?.comment ?? ""}
  rows={3}
/>
```

El textarea de comentario de reseña **no tiene `<label>` asociado**. Violación WCAG 2.1 Level A.

---

## Solución

```tsx
// DESPUÉS (correcto)
<div className="space-y-2">
  <Label htmlFor="review-comment">
    Tu comentario (opcional)
  </Label>
  <Textarea
    id="review-comment"
    name="comment"
    placeholder="¿Qué te pareció el curso?"
    defaultValue={existingReview?.comment ?? ""}
    rows={3}
  />
</div>
```

---

## Criterios de Aceptación

- [ ] Textarea tiene `id="review-comment"` único
- [ ] Label tiene `htmlFor="review-comment"`
- [ ] Screen reader anuncia "Tu comentario (opcional)" al enfocar
- [ ] Axe DevTools: 0 violations en A3
- [ ] Focus visible en textarea

---

## Testing

```bash
npx axe-core src/components/courses/review-form.tsx
```

---

**Asignado a:** [Frontend]  
**Estimación:** 1pt
