# FIX-007 — Información "Lección completada" sin semántica accesible (Accesibilidad)

**Estado:** ✅ Done  
**Severidad:** ⚠️ Important  
**Criterio:** A4 (Roles ARIA — información sin semántica)  
**Estimación:** 1pt (~10 min)  
**Componente:** `src/components/player/mark-complete-button.tsx`

---

## Problema

```tsx
// Línea 14–16 — ANTES (incorrecto)
<div className="flex items-center gap-2">
  <CheckCircle2 size={20} className="text-green-500" />
  <span>Lección completada</span>
</div>
```

Información crítica en `<div>` genérico. Screen reader:
- ❌ No anuncia cambio de estado ("Lección completada")
- ❌ Trata como contenido estático, no como actualización dinámica
- ❌ Usuario ciego no se percata del cambio

---

## Solución

```tsx
// DESPUÉS (correcto)
<div 
  role="status" 
  aria-live="polite"
  aria-atomic="true"
  className="flex items-center gap-2"
>
  <CheckCircle2 size={20} className="text-green-500" aria-hidden="true" />
  <span>Lección completada</span>
</div>
```

---

## Atributos explicados

| Atributo | Valor | Propósito |
|----------|-------|----------|
| `role="status"` | — | Indica que esto es una región de estado/información |
| `aria-live="polite"` | — | Screen reader anuncia cambios sin interrumpir lectura actual |
| `aria-atomic="true"` | — | Anuncia todo el contenido del div cuando cambia |
| `aria-hidden="true"` | En ícono | El ícono es decorativo, no incluir en anuncio |

---

## Criterios de Aceptación

- [ ] Div tiene `role="status"`
- [ ] Div tiene `aria-live="polite"`
- [ ] Screen reader anuncia "Lección completada" cuando se marca como completa
- [ ] Ícono tiene `aria-hidden="true"` (es decorativo)
- [ ] Axe DevTools: 0 violations A4
- [ ] Funciona en NVDA/JAWS/VoiceOver

---

## Alternativa: Elemento semántico

```tsx
<output
  className="flex items-center gap-2 text-green-600"
>
  <CheckCircle2 size={20} aria-hidden="true" />
  <span>Lección completada</span>
</output>
```

`<output>` es elemento semántico HTML5 para resultados/cambios dinámicos.

---

## Testing

```bash
# Axe
npx axe-core src/components/player/mark-complete-button.tsx

# Manual: Usar NVDA/JAWS y marcar lección como completada
# Verificar que screen reader anuncia "Lección completada"
```

---

**Asignado a:** [Frontend]  
**Estimación:** 1pt  
**Prioridad:** Importante para UX accesible de usuarios ciegos
