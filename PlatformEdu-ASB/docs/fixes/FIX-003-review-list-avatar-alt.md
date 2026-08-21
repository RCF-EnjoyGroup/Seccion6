# FIX-003 — Imagen de avatar sin alt (Accesibilidad + SEO)

**Estado:** ✅ Done  
**Severidad:** ⛔ Blocking  
**Criterio:** A1 / B2 (Imagen sin alt - doble impacto)  
**Estimación:** 1pt (~5 min)  
**Componente:** `src/components/courses/review-list.tsx`

---

## Problema

```tsx
// Línea 36–38 — ANTES (incorrecto)
<Avatar className="size-9">
  <AvatarImage src={review.student?.avatar_url ?? undefined} />
  <AvatarFallback>{initials}</AvatarFallback>
</Avatar>
```

`<AvatarImage>` (que es un wrapper de `<img>`) **no tiene atributo `alt`**. Impacto:
- ❌ a11y: Usuario ciego no sabe quién es la persona en el avatar
- ❌ SEO: Imagen no indexada en búsqueda de imágenes
- ❌ Violación WCAG 2.1 + SEO best practices

---

## Solución

```tsx
// DESPUÉS (correcto)
<Avatar className="size-9">
  <AvatarImage 
    src={review.student?.avatar_url ?? undefined}
    alt={`Avatar de ${review.student?.full_name ?? 'estudiante'}`}
  />
  <AvatarFallback>{initials}</AvatarFallback>
</Avatar>
```

---

## Detalles

- **Props necesario:** `alt` en `<AvatarImage>`
- **Contenido del alt:** Descripción clara: "Avatar de [nombre del estudiante]"
- **Fallback:** Usar `{initials}` como fallback si no hay imagen

---

## Criterios de Aceptación

- [ ] `<AvatarImage>` tiene prop `alt` con nombre del estudiante
- [ ] Alt text es descriptivo ("Avatar de Juan Pérez")
- [ ] Screen reader anuncia el nombre del estudiante
- [ ] Axe DevTools: 0 violations A1 en este componente
- [ ] Google Images podría indexar la imagen si fuera pública

---

## Testing

```bash
# Verificar alt text
npx axe-core src/components/courses/review-list.tsx

# Visual: pasar mouse sobre imagen, inspeccionar alt attribute
```

---

**Asignado a:** [Frontend]  
**Estimación:** 1pt
