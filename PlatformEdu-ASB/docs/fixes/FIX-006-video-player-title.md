# FIX-006 — Elemento video sin identificación accesible (Accesibilidad)

**Estado:** ✅ Done  
**Severidad:** ⛔ Blocking  
**Criterio:** A2 (Video sin title/aria-label)  
**Estimación:** 1pt (~5 min)  
**Componente:** `src/components/player/video-player.tsx`

---

## Problema

```tsx
// Línea 7 — ANTES (incorrecto)
<video
  ref={videoRef}
  src={videoUrl}
  controls
  className="w-full h-full bg-black"
/>
```

Elemento `<video>` **sin `title`, `aria-label`, ni descripción accesible**. Screen reader no puede identificar qué es o de qué trata.

---

## Solución

```tsx
// DESPUÉS (correcto)
<video
  ref={videoRef}
  src={videoUrl}
  controls
  className="w-full h-full bg-black"
  title={`Video de lección: ${lessonTitle || 'Contenido del curso'}`}
  aria-label={`Reproductor de video: ${lessonTitle || 'Contenido del curso'}`}
/>
```

---

## Criterios de Aceptación

- [ ] `<video>` tiene `title` descriptivo
- [ ] `<video>` tiene `aria-label` descriptivo (información redundante para accesibilidad)
- [ ] Screen reader anuncia título/descripción del video
- [ ] Atributo `controls` permanece visible (para que usuarios vean play/pause/volumen)
- [ ] Axe DevTools: 0 violations A2

---

## Notas

- **`title`:** Información que aparece en tooltip al pasar mouse
- **`aria-label`:** Específicamente para screen readers
- Ambos deben ser descriptivos: incluir nombre de la lección o módulo

---

**Asignado a:** [Frontend]  
**Estimación:** 1pt  
**Nota técnica:** Si `lessonTitle` viene de props, asegurarse que esté disponible en componente
