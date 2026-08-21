# FIX-001 — Input de búsqueda sin Label (Accesibilidad)

**Estado:** ✅ Done  
**Severidad:** ⛔ Blocking  
**Criterio:** A3 (Input sin label asociado)  
**Estimación:** 1pt (~15 min)  
**Componente:** `src/components/catalog/course-filters.tsx`

---

## Problema

```tsx
// Línea 68 — ANTES (incorrecto)
<Input
  placeholder="Buscar cursos..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

El input de búsqueda **no tiene `<label>` asociado**. Únicamente usa `placeholder`, que:
- ❌ NO sustituye un label
- ❌ No es leído por screen readers como identificador del campo
- ❌ Desaparece cuando el usuario empieza a escribir
- ❌ Violación WCAG 2.1 Level A (crítica)

---

## Solución

### Opción A: Label explícito (RECOMENDADO)

```tsx
// Línea 65–70 — DESPUÉS (correcto)
<div className="space-y-2">
  <Label htmlFor="search-courses">
    Buscar cursos
  </Label>
  <Input
    id="search-courses"
    placeholder="Ej: React, Python, Diseño..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>
```

**Ventajas:**
- ✅ Accesible (screen reader lee "Buscar cursos")
- ✅ Mejor UX (label visible en pantalla)
- ✅ Fácil de hacer focus al label
- ✅ Estándar WCAG

---

### Opción B: aria-label (Si no hay espacio para label visible)

```tsx
<Input
  id="search-courses"
  placeholder="Buscar cursos..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  aria-label="Buscar cursos por nombre, categoría o instructor"
/>
```

**Nota:** Menos preferida que opción A (aria-label es fallback).

---

## Criterios de Aceptación

- [ ] Input tiene `id="search-courses"` único
- [ ] Label tiene `htmlFor="search-courses"` que coincide
- [ ] Screen reader (NVDA/JAWS/VoiceOver) anuncia "Buscar cursos" al enfocar el input
- [ ] Axe DevTools no reporta violations de a11y
- [ ] Placeholder dice algo útil (ej: "Ej: React, Python")
- [ ] Focus visible en el input (outline o ring Tailwind)

---

## Testing

### Manual
1. Usar NVDA (Windows) o VoiceOver (Mac)
2. Tab al input y verificar que screen reader anuncia "Buscar cursos"
3. Verificar que placeholder aparece y desaparece correctly

### Automático
```bash
npx axe-core src/components/catalog/course-filters.tsx
```

### E2E (opcional)
```cypress
cy.get('label[for="search-courses"]').should('exist')
cy.get('input#search-courses').should('have.attribute', 'aria-label')
```

---

## Archivo a modificar

- **Ruta:** `src/components/catalog/course-filters.tsx`
- **Línea(s):** 65–72 (aproximado)
- **Componentes afectados:** `<Label>` (de `@/components/ui/label`)
- **Props requeridas:** `htmlFor` en Label, `id` en Input

---

## Notas técnicas

- Si `course-filters` está dentro de un `<form>`, el id único es crítico
- Considerar reutilizar estilo: `<div className="space-y-2">` (gap entre label e input)
- `placeholder` puede permanecer como hint adicional (no reemplaza label)

---

## Después de arreglar

Ejecutar auditoría nuevamente:
```bash
# Abrir componente en navegador y correr
axe DevTools addon → reporte debe mostrar 0 violations en A3
```

---

**Asignado a:** [Frontend]  
**Bloqueado por:** —  
**Bloquea:** —  
**Creado:** 2026-08-17
