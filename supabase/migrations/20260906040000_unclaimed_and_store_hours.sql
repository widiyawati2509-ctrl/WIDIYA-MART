-- =========================================================
-- PENGENJEK MART: Unclaimed Pickup Expiration & Store Hours
-- =========================================================

-- 1. ADD 'tidak_diambil' STATUS TO ENUM
alter type public.order_status add value if not exists 'tidak_diambil';

-- 2. ADD batas_waktu_ambil TO ORDERS TABLE
alter table public.orders 
  add column if not exists batas_waktu_ambil timestamptz;

-- 3. ADD jam_buka & jam_tutup TO STORE_INFO TABLE
alter table public.store_info 
  add column if not exists jam_buka text default '07:00',
  add column if not exists jam_tutup text default '21:00';

-- 4. TRIGGER: AUTO-SET batas_waktu_ambil (48 hours) ON 'siap_diambil'
create or replace function public.set_order_pickup_deadline()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'siap_diambil' and (old.status is distinct from 'siap_diambil' or new.batas_waktu_ambil is null) then
    if new.batas_waktu_ambil is null then
      new.batas_waktu_ambil := now() + interval '48 hours';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_order_pickup_deadline on public.orders;
create trigger trg_order_pickup_deadline
  before insert or update of status, batas_waktu_ambil
  on public.orders
  for each row
  execute function public.set_order_pickup_deadline();
