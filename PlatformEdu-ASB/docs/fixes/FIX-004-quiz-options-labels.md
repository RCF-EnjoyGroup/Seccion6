# FIX-004 — Inputs de opciones de quiz sin Labels (Accesibilidad - Múltiple)

**Estado:** ✅ Done  
**Severidad:** ⛔ Blocking  
**Criterio:** A3 (Múltiples inputs sin label en loop)  
**Estimación:** 2pt (~20 min)  
**Componente:** `src/components/dashboard/quiz-questions-editor.tsx`

---

## Problema

```tsx
// Línea 62–82 — ANTES (incorrecto)
{lesson.options.map((option, index) => (
  <Input
    key={index}
    placeholder={`Opción ${index + 1}`}
    value={option}
    onChange={(e) => updateOption(index, e.target.value)}
  />
))}
```

Loop de inputs **sin `<label>` asociado**. Cada opción de quiz necesita un identificador accesible, especialmente en contexto de editor.

---

## Solución

### Opción A: Label + Input (Recomendado)

```tsx
// DESPUÉS (correcto)
{lesson.options.map((option, index) => (
  <div key={index} className="space-y-1">
    <Label htmlFor={`option-${index}`}>
      Opción {index + 1}
    </Label>
    <Input
      id={`option-${index}`}
      placeholder="Escribe la opción..."
      value={option}
      onChange={(e) => updateOption(index, e.target.value)}
    />
  </div>
))}
```

**Ventajas:**
- ✅ Cada opción tiene label único
- ✅ Screen reader anuncia "Opción 1", "Opción 2", etc.
- ✅ ID único (`option-0`, `option-1`) previene conflictos
- ✅ Accesible para usuarios navegando con teclado

---

### Opción B: aria-label (Fallback)

```tsx
<Input
  key={index}
  aria-label={`Opción ${index + 1}`}
  placeholder="Escribe la opción..."
  value={option}
  onChange={(e) => updateOption(index, e.target.value)}
/>
```

Menos preferida que A, pero funciona si no hay espacio para label visible.

---

## Criterios de Aceptación

- [ ] Cada `<Input>` en el loop tiene `id={`option-${index}`}` único
- [ ] Cada `<Input>` tiene `<Label htmlFor={...}>`
- [ ] Screen reader anuncia "Opción 1", "Opción 2", etc.
- [ ] Navegación con Tab funciona correctamente
- [ ] Axe DevTools: 0 violations A3
- [ ] UI visualmente consistente con resto del formulario

---

## Refactorización sugerida

Considerar extraer a componente `<QuizOptionInput>` para reutilizar:

```tsx
// src/components/dashboard/quiz-option-input.tsx
interface QuizOptionInputProps {
  index: number
  value: string
  onChange: (index: number, value: string) => void
  onRemove?: (index: number) => void
}

export function QuizOptionInput({
  index,
  value,
  onChange,
  onRemove,
}: QuizOptionInputProps) {
  return (
    <div className="space-y-1 flex items-end gap-2">
      <div className="flex-1">
        <Label htmlFor={`option-${index}`}>
          Opción {index + 1}
        </Label>
        <Input
          id={`option-${index}`}
          placeholder="Escribe la opción..."
          value={value}
          onChange={(e) => onChange(index, e.target.value)}
        />
      </div>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(index)}
          aria-label={`Eliminar opción ${index + 1}`}
        >
          <Trash2 size={16} />
        </Button>
      )}
    </div>
  )
}
```

---

## Testing

```bash
npx axe-core src/components/dashboard/quiz-questions-editor.tsx
```

---

**Asignado a:** [Frontend]  
**Estimación:** 2pt (incluye posible refactorización)  
**Notas:** Si hay botón "Eliminar opción", también necesita `aria-label`
