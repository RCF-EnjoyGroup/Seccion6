# HU-001 — Indicadores de estado accesibles para usuarios con deficiencia de color

**Tipo:** Feature (Accessibility Improvement)  
**Estado:** 📋 Backlog  
**Prioridad:** Medium  
**Estimación:** 2pt  
**Epic:** Accesibilidad & WCAG Compliance  
**Componente:** `src/components/landing/live-simulator.tsx`

---

## Descripción

**Como** usuario con deficiencia de color rojo-verde (daltonismo)  
**Quiero** que los indicadores de estado de conexión usen más que solo color para transmitir información  
**Para que** pueda distinguir si el agente Edy está conectado, desconectado o conectando sin depender del color

---

## Background

Actualmente, el componente `live-simulator.tsx` muestra círculos de colores:
- 🔴 Rojo: Desconectado
- 🟢 Verde: Conectado
- 🟡 Amarillo: Conectando

Usuarios con daltonismo (8% de hombres, 0.5% de mujeres) no pueden distinguir estos colores. Violación WCAG 2.1 AA "Color Not the Only Means".

---

## Criterios de Aceptación

### Funcional
- [ ] Indicador de estado usa **color + otro identificador visual**
  - Opciones: ícono, patrón, texto, animación diferente
- [ ] Estados claramente distintos:
  - Desconectado: círculo gris + X o icono desconectado
  - Conectando: círculo amarillo + animación pulsante + "Conectando..."
  - Conectado: círculo verde + checkmark o ícono conectado
- [ ] Funciona en modo claro y oscuro

### Técnico
- [ ] WCAG 2.1 AA: contraste color ≥ 3:1
- [ ] Performance: sin SVG complejos innecesarios
- [ ] Responsive: indicador visible en mobile

### Accesibilidad
- [ ] Screen reader anuncia estado ("Conectado", "Desconectado", "Conectando")
- [ ] `aria-label` descriptivo en indicador
- [ ] Texto accesible alternativo para usuarios con baja visión

### Analytics
- [ ] Track evento "connection_status_changed" en Sentry/mixpanel
- [ ] Verificar que usuarios con daltonismo pueden interactuar sin errores

---

## Escenarios Gherkin

### Escenario 1: Indicador conectado

```gherkin
Given un usuario abre live-simulator
When el agente Edy está conectado
Then veo:
  - Círculo verde (color)
  - Checkmark verde (ícono)
  - Texto "Edy conectado" (accesibilidad)
  - aria-label="Estado: conectado"
```

### Escenario 2: Indicador desconectado

```gherkin
Given el usuario inicia sesión
When el agente se desconecta
Then veo:
  - Círculo gris/neutro (color)
  - Ícono X o desconectado (visual)
  - Texto "Desconectado" (accesibilidad)
  - aria-label="Estado: desconectado"
```

### Escenario 3: Indicador conectando

```gherkin
Given usuario abre widget
When está intentando conectar
Then veo:
  - Círculo amarillo/naranja (color)
  - Animación pulsante (movimiento)
  - Texto "Conectando..." (accesibilidad)
  - aria-label="Estado: conectando"
```

---

## Diseño / Mockup

Crear en Figma con estados:
- [ ] Conectado: verde + ✓ ícono
- [ ] Desconectado: gris + ✗ ícono
- [ ] Conectando: amarillo + animación + "Conectando..."

Colores accesibles:
- Conectado: #16a34a (verde 600 Tailwind) — contraste ≥ 4.5:1 sobre fondo
- Desconectado: #6b7280 (gris 500) — contraste ≥ 4.5:1
- Conectando: #ca8a04 (amarillo 600) — contraste ≥ 3:1 para texto grande

---

## Dependencias

- [ ] Cambio visual en live-simulator.tsx (línea 87–89)
- [ ] Posible crear componente `<ConnectionStatusIndicator>` reutilizable
- [ ] Sin dependencias de backend/API

---

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|-----------|
| Indicador visual demasiado "ruidoso" | Media | Bajo | Testing con usuarios, iteración en diseño |
| Animación causa epilepsia fotosensible | Baja | Alto | Respetar `prefers-reduced-motion`, max 3 parpados/seg |

---

## Notas Técnicas

**Stack:** Next.js 15, React 19, Tailwind CSS  
**Componentes:** `live-simulator.tsx`  
**Librerías:** Posible lucide-react para íconos

### Propuesta de código

```tsx
// Indicador refactorizado
interface ConnectionStatus {
  state: 'connected' | 'disconnected' | 'connecting'
}

function ConnectionStatusIndicator({ state }: ConnectionStatus) {
  const statusConfig = {
    connected: {
      color: 'bg-green-600',
      icon: <CheckCircle2 size={16} />,
      label: 'Conectado',
      animation: '',
    },
    disconnected: {
      color: 'bg-gray-500',
      icon: <XCircle size={16} />,
      label: 'Desconectado',
      animation: '',
    },
    connecting: {
      color: 'bg-yellow-600',
      icon: <Loader2 size={16} />,
      label: 'Conectando',
      animation: 'animate-pulse',
    },
  }

  const { color, icon, label, animation } = statusConfig[state]

  return (
    <div
      className={`flex items-center gap-2 ${color} ${animation} rounded-full px-2 py-1`}
      role="status"
      aria-live="polite"
      aria-label={`Estado: ${label}`}
    >
      <div className="text-white">{icon}</div>
      <span className="text-xs font-medium text-white">{label}</span>
    </div>
  )
}
```

---

## Subtareas

- **[001] Diseño en Figma** — Crear mockups de 3 estados (2pt)
- **[002] Componente reutilizable** — Extraer `<ConnectionStatusIndicator>` (2pt)
- **[003] Testing a11y** — Verificar con axe + screen readers (1pt)
- **[004] Testing reducida-motion** — Respetar preferencias de usuarios (1pt)

**Estimación Total:** 2pt (para primera iteración)

---

## Definición de Ready

- [ ] Diseño aprobado en Figma
- [ ] Estimación consensuada
- [ ] No hay ambigüedad sobre estados visuales
- [ ] WCAG 2.1 AA criteria definidos

## Definición de Done

- [ ] Código en main
- [ ] Tests: axe DevTools ✅, screen reader ✅, reducida-motion ✅
- [ ] Code review aprobado
- [ ] Desplegado a staging
- [ ] Verificado con usuarios daltonismo

---

**Creado:** 2026-08-17  
**Asignado a:** [Frontend + UX]  
**Bloqueado por:** —  
**Bloquea:** —
