# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-08-17

### Fixed - Accesibilidad (a11y)

- **FIX-001**: Agregado `<Label>` al input de búsqueda en `src/components/catalog/course-filters.tsx` (WCAG 2.1 A3)
- **FIX-002**: Agregado `<Label>` al textarea de reseña en `src/components/courses/review-form.tsx` (WCAG 2.1 A3)
- **FIX-003**: Agregado atributo `alt` descriptivo a `<AvatarImage>` en `src/components/courses/review-list.tsx` (WCAG 2.1 A1, SEO B2)
- **FIX-004**: Agregados `<Label>` con IDs únicos a cada input de opción de quiz en `src/components/dashboard/quiz-questions-editor.tsx` (WCAG 2.1 A3)
- **FIX-005**: Agregado `aria-label` dinámico al botón play/pause en `src/components/landing/live-simulator.tsx` (WCAG 2.1 A2)
- **FIX-006**: Agregados atributos `title` y `aria-label` al elemento `<video>` en `src/components/player/video-player.tsx` (WCAG 2.1 A2)
- **FIX-007**: Agregados `role="status"`, `aria-live="polite"`, `aria-atomic="true"` y `aria-hidden="true"` al indicador de lección completada en `src/components/player/mark-complete-button.tsx` (WCAG 2.1 A4)

### Documentation

- Actualizados docs de fixes: Estado cambiado de "To Do" a "Done" en todos los 7 documentos FIX
- Actualizado `docs/README.md` para reflejar completitud de fixes
- Agregado Changelog

## [1.2.0] - 2026-08-24

### Added - CI/CD Pipeline

- **CI-001**: Creado `.github/workflows/ci.yml` con pipeline de 5 gates de calidad:
  - Gate 1: ESLint + TypeScript check
  - Gate 2: Unit tests (Vitest)
  - Gate 3: Integration tests (Vitest)
  - Gate 4: Build de producción (Next.js)
  - Gate 5: Deploy automático a Vercel (solo en `main`/`master`)
- **CI-002**: Preview automático en Vercel para Pull Requests con URL comentada en el PR
- **CI-003**: Concurrency group para cancelar workflows redundantes
- **CI-004**: Documentación de CI/CD en README.md

## [Unreleased]