-- =========================================================
-- PENGENJEK MART: User Addresses Migration & RLS
-- =========================================================

create table if not exists public.user_addresses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  label           text not null, -- e.g. 'Rumah', 'Kantor', 'Kos'
  alamat_lengkap  text not null,
  lat             numeric(10, 7),
  long            numeric(10, 7),
  is_default      boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Index for faster query by user
create index if not exists idx_user_addresses_user_id on public.user_addresses(user_id);

-- Enable RLS for user_addresses
alter table public.user_addresses enable row level security;

-- Policies for user_addresses (per-user CRUD)
drop policy if exists "Users can view their own addresses" on public.user_addresses;
create policy "Users can view their own addresses"
  on public.user_addresses for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own addresses" on public.user_addresses;
create policy "Users can insert their own addresses"
  on public.user_addresses for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own addresses" on public.user_addresses;
create policy "Users can update their own addresses"
  on public.user_addresses for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own addresses" on public.user_addresses;
create policy "Users can delete their own addresses"
  on public.user_addresses for delete
  to authenticated
  using (auth.uid() = user_id);
