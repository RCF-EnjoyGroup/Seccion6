-- ============================================================================
-- 0005_embeddings.sql
-- Embeddings vectoriales para cursos: columna embedding + trigger que llama
-- a Edge Function (gte-small) al publicar/insertar curso.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extensión pgvector (requerida para tipo vector)
-- ---------------------------------------------------------------------------

create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- Columna embedding en courses (gte-small = 384 dimensiones)
-- ---------------------------------------------------------------------------

alter table courses
add column if not exists embedding vector(384);

create index if not exists courses_embedding_idx
on courses using hnsw (embedding vector_cosine_ops)
with (m = 16, ef_construction = 64);

-- ---------------------------------------------------------------------------
-- Función auxiliar: construir el texto a embeber (replica lógica TS)
-- ---------------------------------------------------------------------------

create or replace function build_course_embedding_text(
  p_course_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_description text;
  v_short_description text;
  v_level text;
  v_category text;
  v_section_titles text[];
  v_lesson_titles text[];
  v_result text;
begin
  -- Datos básicos del curso
  select title, description, short_description, level::text, category
  into v_title, v_description, v_short_description, v_level, v_category
  from courses
  where id = p_course_id;

  if v_title is null then
    return '';
  end if;

  -- Títulos de sections ordenados
  select array_agg(s.title order by s.position)
  into v_section_titles
  from sections s
  where s.course_id = p_course_id;

  -- Títulos de lessons ordenados (por section.position, lesson.position)
  select array_agg(l.title order by s.position, l.position)
  into v_lesson_titles
  from lessons l
  join sections s on s.id = l.section_id
  where s.course_id = p_course_id;

  v_result := v_title;

  if v_description is not null then
    v_result := v_result || ' ' || v_description;
  end if;

  if v_short_description is not null then
    v_result := v_result || ' ' || v_short_description;
  end if;

  v_result := v_result || ' ' || v_level || ' ' || v_category;

  if v_section_titles is not null then
    v_result := v_result || ' ' || array_to_string(v_section_titles, ' ');
  end if;

  if v_lesson_titles is not null then
    v_result := v_result || ' ' || array_to_string(v_lesson_titles, ' ');
  end if;

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Función trigger: invoca Edge Function para generar embedding
-- Usa pg_net (disponible en Supabase) para HTTP POST asíncrono.
-- ---------------------------------------------------------------------------

create or replace function trigger_course_embedding()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_text text;
  v_payload jsonb;
  v_response jsonb;
begin
  -- Solo actuar si el curso está publicado (insert o update a published)
  if new.status <> 'published' then
    return new;
  end if;

  -- Evitar re-embedding si ya tiene embedding y no cambió el contenido relevante
  if old is not null
     and old.title = new.title
     and old.description is not distinct from new.description
     and old.short_description is not distinct from new.short_description
     and old.level = new.level
     and old.category = new.category
     and new.embedding is not null
  then
    return new;
  end if;

  -- Construir texto a embeber
  v_text := build_course_embedding_text(new.id);
  if v_text = '' then
    return new;
  end if;

  -- Payload para la Edge Function
  v_payload := jsonb_build_object(
    'course_id', new.id,
    'text', v_text
  );

  -- Llamada asíncrona a la Edge Function (no bloquea la transacción)
  -- La Edge Function debe: generar embedding con gte-small -> UPDATE courses SET embedding = $1 WHERE id = $2
  -- Requiere pg_net extension habilitada en Supabase (Settings -> Database -> Extensions -> pg_net)
  -- URL y key hardcodeadas para evitar custom parameters (plan free)
  perform net.http_post(
    url := 'https://anfevrtbbgdlhfrmxdue.supabase.co/functions/v1/embed-course',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuZmV2cnRiYmdkbGhmcm14ZHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDQyMjIsImV4cCI6MjA3MDE4MDIyMn0.ceRl7V6eX4WVQxU7cYVJ8QY6QzZ8YzQwNzY5ODc2NTQ'
    ),
    body := v_payload,
    timeout_milliseconds := 5000
  );

  return new;
exception
  when others then
    -- Log del error pero no fallar la transacción del curso
    raise warning 'Error al invocar Edge Function embedding para curso %: %', new.id, sqlerrm;
    return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Trigger: after insert or update en courses
-- ---------------------------------------------------------------------------

drop trigger if exists course_embedding_trigger on courses;

create trigger course_embedding_trigger
  after insert or update on courses
  for each row
  execute function trigger_course_embedding();

-- ---------------------------------------------------------------------------
-- Comentarios
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Función RPC: búsqueda por similitud coseno (solo cursos publicados)
-- ---------------------------------------------------------------------------

create or replace function search_courses_by_embedding(
  query_embedding vector(384),
  match_threshold float default 0.5,
  match_count int default 10
)
returns table (
  id uuid,
  instructor_id uuid,
  title text,
  slug text,
  description text,
  short_description text,
  thumbnail_url text,
  category text,
  level course_level,
  price numeric(10,2),
  status course_status,
  language text,
  rating_average numeric(3,2),
  rating_count integer,
  student_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
language sql
security definer
set search_path = public
as $$
  select
    c.id,
    c.instructor_id,
    c.title,
    c.slug,
    c.description,
    c.short_description,
    c.thumbnail_url,
    c.category,
    c.level,
    c.price,
    c.status,
    c.language,
    c.rating_average,
    c.rating_count,
    c.student_count,
    c.created_at,
    c.updated_at,
    1 - (c.embedding <=> query_embedding) as similarity
  from courses c
  where c.status = 'published'
    and c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) >= match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

comment on function search_courses_by_embedding(vector(384), float, int) is 'Búsqueda semántica por similitud coseno en cursos publicados. Retorna cursos con score de similitud >= match_threshold, ordenados por relevancia.';

comment on column courses.embedding is 'Vector embedding (384-d, gte-small) para búsqueda semántica. Generado por Edge Function via trigger.';
comment on function build_course_embedding_text(uuid) is 'Concatena title, description, short_description, level, category y títulos de sections/lessons ordenados por position.';
comment on function trigger_course_embedding() is 'Trigger que invoca Edge Function asíncrona para generar embedding cuando un curso se publica.';