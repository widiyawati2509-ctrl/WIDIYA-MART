-- =========================================================
-- Widiya Mart — Quick Fix Infinite Recursion RLS
-- Jalankan skrip ini di Supabase SQL Editor
-- =========================================================

-- 1. Fungsi helper aman (SECURITY DEFINER) untuk cek role admin tanpa memicu RLS profiles
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- 2. Perbaiki Policy di tabel profiles
drop policy if exists "Admin akses semua profil" on public.profiles;
create policy "Admin akses semua profil"
  on public.profiles for all
  using (public.is_admin());

-- 3. Perbaiki Policy di tabel categories
drop policy if exists "Admin kelola kategori" on public.categories;
create policy "Admin kelola kategori"
  on public.categories for all
  using (public.is_admin());

-- 4. Perbaiki Policy di tabel products
drop policy if exists "Admin kelola produk" on public.products;
create policy "Admin kelola produk"
  on public.products for all
  using (public.is_admin());

-- 5. Perbaiki Policy di tabel addresses
drop policy if exists "Admin lihat semua alamat" on public.addresses;
create policy "Admin lihat semua alamat"
  on public.addresses for select
  using (public.is_admin());

-- 6. Perbaiki Policy di tabel orders
drop policy if exists "Admin kelola semua pesanan" on public.orders;
create policy "Admin kelola semua pesanan"
  on public.orders for all
  using (public.is_admin());

-- 7. Perbaiki Policy di tabel order_items
drop policy if exists "Admin kelola semua item pesanan" on public.order_items;
create policy "Admin kelola semua item pesanan"
  on public.order_items for all
  using (public.is_admin());

-- 8. Perbaiki Policy di tabel store_info
drop policy if exists "Admin update info toko" on public.store_info;
create policy "Admin update info toko"
  on public.store_info for all
  using (public.is_admin());

-- 9. Pastikan data kategori dasar terisi
insert into public.categories (nama, slug, urutan) values
  ('Sembako',    'sembako',    1),
  ('Minuman',    'minuman',    2),
  ('Snack',      'snack',      3),
  ('Kebersihan', 'kebersihan', 4),
  ('Perawatan',  'perawatan',  5),
  ('Lainnya',    'lainnya',    99)
on conflict (slug) do nothing;
