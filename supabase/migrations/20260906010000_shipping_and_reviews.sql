-- =========================================================
-- PENGENJEK MART: Radius Shipping & Product Reviews Migration
-- =========================================================

-- 1. ADD SHIPPING / ONGKIR COLUMNS TO ORDERS TABLE
alter table public.orders 
  add column if not exists jarak_km numeric(6,2) default 0,
  add column if not exists ongkir integer default 0,
  add column if not exists alamat_pengiriman text,
  add column if not exists metode_pengiriman text default 'ambil_di_toko';

-- 2. CREATE PRODUCT REVIEWS TABLE
create table if not exists public.product_reviews (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  product_id     uuid not null references public.products(id) on delete cascade,
  order_id       uuid references public.orders(id) on delete set null,
  rating         int not null check (rating >= 1 and rating <= 5),
  ulasan         text,
  nama_reviewer  text not null,
  created_at     timestamptz not null default now(),
  constraint unique_user_product_review unique (user_id, product_id)
);

-- Enable RLS for product_reviews
alter table public.product_reviews enable row level security;

-- Policies for product_reviews
drop policy if exists "Semua orang bisa membaca ulasan produk" on public.product_reviews;
create policy "Semua orang bisa membaca ulasan produk"
  on public.product_reviews for select
  using (true);

drop policy if exists "Pengguna terautentikasi bisa memberi ulasan" on public.product_reviews;
create policy "Pengguna terautentikasi bisa memberi ulasan"
  on public.product_reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Pengguna bisa mengedit ulasannya sendiri" on public.product_reviews;
create policy "Pengguna bisa mengedit ulasannya sendiri"
  on public.product_reviews for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Pengguna atau admin bisa menghapus ulasan" on public.product_reviews;
create policy "Pengguna atau admin bisa menghapus ulasan"
  on public.product_reviews for delete
  to authenticated
  using (auth.uid() = user_id or public.is_admin());
