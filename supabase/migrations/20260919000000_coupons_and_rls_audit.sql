-- =========================================================================
-- PENGENJEK MART: MIGRATION KODE PROMO / KUPON & AUDIT RLS PROTEKSI DATA
-- File: 20260919000000_coupons_and_rls_audit.sql
-- =========================================================================

-- 1. TABEL KUPON / VOUCHER (coupons)
create table if not exists public.coupons (
  id              uuid primary key default gen_random_uuid(),
  kode            text not null unique,
  judul           text not null,
  deskripsi       text,
  tipe            text not null default 'flat' check (tipe in ('flat', 'persen')),
  nilai           numeric(12,2) not null check (nilai > 0),
  min_belanja     numeric(12,2) not null default 0 check (min_belanja >= 0),
  max_potongan    numeric(12,2),
  kuota           int default null,
  terpakai        int not null default 0,
  start_date      timestamptz not null default now(),
  end_date        timestamptz,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Index untuk pencarian kode kupon cepat
create index if not exists idx_coupons_kode on public.coupons(kode);
create index if not exists idx_coupons_is_active on public.coupons(is_active);

-- Enable RLS untuk coupons
alter table public.coupons enable row level security;

-- Policy Coupons
drop policy if exists "Semua bisa cek kupon aktif" on public.coupons;
create policy "Semua bisa cek kupon aktif"
  on public.coupons for select
  using (is_active = true);

drop policy if exists "Admin kelola kupon" on public.coupons;
create policy "Admin kelola kupon"
  on public.coupons for all
  using (public.is_admin())
  with check (public.is_admin());

-- Function atomic use_coupon untuk mencegah race condition kuota kupon
create or replace function public.use_coupon(p_code text)
returns boolean
language plpgsql
security definer
as $$
declare
  v_kuota int;
  v_terpakai int;
begin
  select kuota, terpakai into v_kuota, v_terpakai
  from public.coupons
  where upper(kode) = upper(p_code) and is_active = true
  for update;

  if not found then
    return false;
  end if;

  if v_kuota is not null and v_terpakai >= v_kuota then
    return false;
  end if;

  update public.coupons
  set terpakai = terpakai + 1,
      updated_at = now()
  where upper(kode) = upper(p_code);

  return true;
end;
$$;

-- 2. DUKUNGAN KOLOM KUPON PADA TABEL ORDERS
alter table public.orders
  add column if not exists kode_kupon text,
  add column if not exists diskon_kupon numeric(12,2) default 0,
  add column if not exists dusun_pengiriman text;

-- 3. AUDIT & PERBAIKAN RLS TABEL PROFILES
alter table public.profiles enable row level security;

drop policy if exists "User lihat profil sendiri" on public.profiles;
create policy "User lihat profil sendiri"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "User update profil sendiri" on public.profiles;
create policy "User update profil sendiri"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Admin akses semua profil" on public.profiles;
create policy "Admin akses semua profil"
  on public.profiles for all
  using (public.is_admin());

-- 4. AUDIT & PERBAIKAN RLS TABEL ORDERS
alter table public.orders enable row level security;

drop policy if exists "User lihat pesanan sendiri" on public.orders;
create policy "User lihat pesanan sendiri"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "User buat pesanan" on public.orders;
create policy "User buat pesanan"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Cegah customer mengubah langsung status pesanan atau total uang
drop policy if exists "User update pesanan sendiri" on public.orders;

drop policy if exists "User hapus pesanan sendiri" on public.orders;
create policy "User hapus pesanan sendiri"
  on public.orders for delete
  using (auth.uid() = user_id);

drop policy if exists "Admin kelola semua pesanan" on public.orders;
create policy "Admin kelola semua pesanan"
  on public.orders for all
  using (public.is_admin());

-- 5. AUDIT & PERBAIKAN RLS TABEL ORDER_ITEMS
alter table public.order_items enable row level security;

drop policy if exists "User lihat item pesanan sendiri" on public.order_items;
create policy "User lihat item pesanan sendiri"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "User buat item pesanan" on public.order_items;
create policy "User buat item pesanan"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "User hapus item pesanan sendiri" on public.order_items;
create policy "User hapus item pesanan sendiri"
  on public.order_items for delete
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "Admin kelola semua item pesanan" on public.order_items;
create policy "Admin kelola semua item pesanan"
  on public.order_items for all
  using (public.is_admin());

-- 6. AUDIT & PERBAIKAN RLS TABEL USER_ADDRESSES
alter table public.user_addresses enable row level security;

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

drop policy if exists "Admin lihat semua user_addresses" on public.user_addresses;
create policy "Admin lihat semua user_addresses"
  on public.user_addresses for select
  using (public.is_admin());

-- 7. SEED INITIAL VOUCHERS / KUPON DISKON TOKO
insert into public.coupons (kode, judul, deskripsi, tipe, nilai, min_belanja, max_potongan, kuota, is_active)
values
  ('PENGENJEK5K', 'Diskon Warga Pengenjek', 'Potongan langsung Rp 5.000 dengan minimal belanja Rp 30.000', 'flat', 5000, 30000, null, 100, true),
  ('HEMAT10', 'Diskon Hemat 10%', 'Potongan 10% (maksimal Rp 10.000) dengan minimal belanja Rp 25.000', 'persen', 10, 25000, 10000, 200, true),
  ('WARGAHEMAT', 'Voucher Warga Baru', 'Potongan Rp 3.000 untuk belanja apa saja minimal Rp 15.000', 'flat', 3000, 15000, null, 500, true)
on conflict (kode) do nothing;
