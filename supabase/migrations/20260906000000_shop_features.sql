-- =========================================================
-- Widiya Mart / PENGENJEK MART: Shopping Lists, Loyalty, & Promos Migration
-- =========================================================

-- 1. SHOPPING LISTS (Daftar Belanja / Wishlist)
create table if not exists public.shopping_lists (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

alter table public.shopping_lists enable row level security;

drop policy if exists "User kelola daftar belanja sendiri" on public.shopping_lists;
create policy "User kelola daftar belanja sendiri"
  on public.shopping_lists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admin akses semua daftar belanja" on public.shopping_lists;
create policy "Admin akses semua daftar belanja"
  on public.shopping_lists for select
  using (public.is_admin());

-- 2. LOYALTY CONFIG (Skema Poin Sederhana - Fleksibel)
create table if not exists public.loyalty_config (
  id                     int primary key default 1 check (id = 1),
  is_active              boolean not null default true,
  threshold_amount       numeric(12,2) not null default 10000, -- kelipatan belanja untuk dapat poin (misal 10.000)
  points_per_threshold   int not null default 1,               -- poin per kelipatan (misal 1 poin)
  redeem_rate            numeric(12,2) not null default 100,   -- nilai rupiah per 1 poin (misal 1 poin = Rp 100)
  min_order_amount       numeric(12,2) not null default 10000, -- min belanja untuk dapat poin
  max_redeem_percentage  int not null default 50,              -- batas persen diskon belanja dari poin (misal max 50%)
  updated_at             timestamptz not null default now()
);

alter table public.loyalty_config enable row level security;

drop policy if exists "Semua bisa baca konfigurasi loyalitas" on public.loyalty_config;
create policy "Semua bisa baca konfigurasi loyalitas"
  on public.loyalty_config for select using (true);

drop policy if exists "Admin kelola konfigurasi loyalitas" on public.loyalty_config;
create policy "Admin kelola konfigurasi loyalitas"
  on public.loyalty_config for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed initial loyalty config
insert into public.loyalty_config (id, is_active, threshold_amount, points_per_threshold, redeem_rate, min_order_amount, max_redeem_percentage)
values (1, true, 10000, 1, 100, 10000, 50)
on conflict (id) do nothing;

-- 3. LOYALTY TRANSACTIONS (Buku Besar Poin Pelanggan)
create table if not exists public.loyalty_transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  order_id    uuid references public.orders(id) on delete set null,
  points      int not null, -- positif untuk didapat, negatif untuk dipakai/ditukar
  type        text not null check (type in ('earned', 'redeemed', 'adjusted')),
  description text not null,
  created_at  timestamptz not null default now()
);

alter table public.loyalty_transactions enable row level security;

drop policy if exists "User lihat riwayat poin sendiri" on public.loyalty_transactions;
create policy "User lihat riwayat poin sendiri"
  on public.loyalty_transactions for select
  using (auth.uid() = user_id);

drop policy if exists "Admin kelola semua transaksi poin" on public.loyalty_transactions;
create policy "Admin kelola semua transaksi poin"
  on public.loyalty_transactions for all
  using (public.is_admin())
  with check (public.is_admin());

-- 4. PROMOS (Promo Aktual & Banner Hari Ini)
create table if not exists public.promos (
  id            uuid primary key default uuid_generate_v4(),
  judul         text not null,
  subjudul      text,
  tipe          text not null default 'banner' check (tipe in ('banner', 'diskon_produk')),
  product_id    uuid references public.products(id) on delete set null,
  badge_text    text default 'PROMO HARI INI',
  diskon_persen int,
  image_url     text,
  banner_bg     text default 'linear-gradient(135deg, #FF6B35 0%, #E85521 100%)',
  link_url      text,
  is_active     boolean not null default true,
  urutan        int not null default 0,
  start_date    timestamptz not null default now(),
  end_date      timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.promos enable row level security;

drop policy if exists "Semua bisa baca promo aktif" on public.promos;
create policy "Semua bisa baca promo aktif"
  on public.promos for select
  using (is_active = true);

drop policy if exists "Admin kelola semua promo" on public.promos;
create policy "Admin kelola semua promo"
  on public.promos for all
  using (public.is_admin())
  with check (public.is_admin());

-- 5. ORDERS COLUMNS (Support Diskon & Poin)
alter table public.orders 
  add column if not exists poin_digunakan int not null default 0,
  add column if not exists diskon_poin numeric(14,2) not null default 0,
  add column if not exists poin_didapat int not null default 0;
