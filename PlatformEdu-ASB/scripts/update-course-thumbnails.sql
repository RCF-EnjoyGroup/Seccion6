-- ============================================================================
-- update-course-thumbnails.sql
-- Reemplaza thumbnails de cursos con imágenes de Unsplash representativas.
-- Ejecutar en Supabase SQL Editor.
-- ============================================================================

-- Programación: monitor con código IDE oscuro
UPDATE courses
SET thumbnail_url = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop'
WHERE category ILIKE '%programación%' OR category ILIKE '%programacion%';

-- Desarrollo Web / Web: múltiples pantallas con código
UPDATE courses
SET thumbnail_url = 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop'
WHERE category ILIKE '%desarrollo web%' OR category ILIKE '%web%';

-- Testing / Playwright / E2E: pantalla con código de testing
UPDATE courses
SET thumbnail_url = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=450&fit=crop'
WHERE category ILIKE '%testing%' OR category ILIKE '%playwright%' OR category ILIKE '%e2e%';

-- Diseño: paleta de colores y herramientas
UPDATE courses
SET thumbnail_url = 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop'
WHERE category ILIKE '%diseño%' OR category ILIKE '%diseno%';

-- Inteligencia Artificial / IA: neural network visualización
UPDATE courses
SET thumbnail_url = 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop'
WHERE category ILIKE '%inteligencia artificial%' OR category ILIKE '%ia %' OR category = 'ia';

-- Datos / Data Science: dashboard con gráficas
UPDATE courses
SET thumbnail_url = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop'
WHERE category ILIKE '%datos%' OR category ILIKE '%data%';

-- Marketing: redes sociales y analytics
UPDATE courses
SET thumbnail_url = 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=450&fit=crop'
WHERE category ILIKE '%marketing%';

-- Negocios: reunión profesional
UPDATE courses
SET thumbnail_url = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop'
WHERE category ILIKE '%negocios%' OR category ILIKE '%business%';

-- Fotografía: cámara profesional
UPDATE courses
SET thumbnail_url = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=450&fit=crop'
WHERE category ILIKE '%foto%' OR category ILIKE '%fotografía%';

-- Música: estudio con teclado
UPDATE courses
SET thumbnail_url = 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=450&fit=crop'
WHERE category ILIKE '%música%' OR category ILIKE '%musica%';

-- Matemáticas: fórmulas
UPDATE courses
SET thumbnail_url = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop'
WHERE category ILIKE '%matemáticas%' OR category ILIKE '%matematicas%';

-- Ciencia: laboratorio
UPDATE courses
SET thumbnail_url = 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=450&fit=crop'
WHERE category ILIKE '%ciencia%';

-- Inglés: libros y aprendizaje
UPDATE courses
SET thumbnail_url = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=450&fit=crop'
WHERE category ILIKE '%inglés%' OR category ILIKE '%ingles%';

-- Verificar resultados
SELECT id, title, category, thumbnail_url
FROM courses
WHERE status = 'published'
ORDER BY student_count DESC;
