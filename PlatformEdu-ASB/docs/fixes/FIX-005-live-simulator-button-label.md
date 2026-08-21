# FIX-005 — Botón play/pause sin aria-label (Accesibilidad)

**Estado:** ✅ Done  
**Severidad:** ⛔ Blocking  
**Criterio:** A2 (Botón sin label accesible)  
**Estimación:** 1pt (~5 min)  
**Componente:** `src/components/landing/live-simulator.tsx`

---

## Problema

```tsx
// Línea 107 — ANTES (incorrecto)
<button
  onClick={() => setIsPlaying(!isPlaying)}
  className="text-muted-foreground hover:text-foreground transition-colors"
>
  {isPlaying ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
</button>
```

Botón con **solo ícono**, sin `aria-label` ni texto accesible. Usuario de screen reader no sabe qué hace.

---

## Solución

```tsx
// DESPUÉS (correcto)
<button
  onClick={() => setIsPlaying(!isPlaying)}
  className="text-muted-foreground hover:text-foreground transition-colors"
  aria-label={isPlaying ? "Pausar simulación" : "Reproducir simulación"}
>
  {isPlaying ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
</button>
```

---

## Criterios de Aceptación

- [ ] Button tiene `aria-label` que cambia según `isPlaying`
- [ ] Texto: "Reproducir simulación" o "Pausar simulación"
- [ ] Screen reader anuncia la acción del botón
- [ ] Axe DevTools: 0 violations A2
- [ ] Focus visible en el botón

---

## Alternativa: Texto visible

Si hay espacio, considerar agregar texto visible:

```tsx
<button
  onClick={() => setIsPlaying(!isPlaying)}
  className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted transition"
>
  {isPlaying ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
  <span className="text-sm font-medium">
    {isPlaying ? "Pausar" : "Reproducir"}
  </span>
</button>
```

---

**Asignado a:** [Frontend]  
**Estimación:** 1pt
