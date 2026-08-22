-- ============================================================================
-- 0005_escalations.sql
-- Tabla para escalamientos del agente Edy a asesores humanos.
-- ============================================================================

create type escalation_status as enum ('pending', 'in_review', 'resolved', 'closed');

create table escalations (
  id uuid primary key default gen_random_uuid(),
  reason text not null,
  summary text not null,
  student_email text,
  student_id uuid references profiles (id) on delete set null,
  student_name text,
  status escalation_status not null default 'pending',
  source text not null default 'edy_agent',
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index escalations_status_idx on escalations (status);
create index escalations_created_at_idx on escalations (created_at);
create index escalations_student_email_idx on escalations (student_email);

comment on table escalations is 'Casos escalados por el agente Edy a asesores humanos (reembolsos, problemas técnicos, reportes, etc).';

-- RLS: solo admin puede leer; el agente escribe con service role (bypass RLS)
alter table escalations enable row level security;

create policy "escalations_select_admin"
  on escalations for select
  using (is_admin());

create policy "escalations_insert_admin"
  on escalations for insert
  with check (is_admin());
