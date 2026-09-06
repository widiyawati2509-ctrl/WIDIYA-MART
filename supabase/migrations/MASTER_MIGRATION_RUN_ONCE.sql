-- =========================================================================
-- PENGENJEK MART: MASTER CONSOLIDATED SQL MIGRATION (RUN ONCE)
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Skrip ini bersifat idempotent (IF NOT EXISTS), aman dijalankan berkali-kali.
-- =========================================================================

-- 1. TABEL PROMO & BANNER BERANDA (promos)
create table if not exists public.promos (
  id            uuid primary key default gen_random_uuid(),
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

create index if not exists idx_promos_is_active_urutan on public.promos(is_active, urutan);
alter table public.promos enable row level security;

drop policy if exists "Semua bisa baca promo aktif" on public.promos;
create policy "Semua bisa baca promo aktif" on public.promos for select using (true);

drop policy if exists "Admin kelola semua promo" on public.promos;
create policy "Admin kelola semua promo" on public.promos for all using (public.is_admin()) with check (public.is_admin());

-- Seed initial promo banners (hanya jika belum ada)
insert into public.promos (judul, subjudul, tipe, badge_text, image_url, banner_bg, link_url, is_active, urutan)
select
  'Mama Lemon Jeruk Nipis',
  'Sabun cuci piring refill 650g cuma Rp 10.000',
  'banner',
  'PROMO SPESIAL',
  '/products/1788105463290-z57uce.jpeg',
  'linear-gradient(135deg, #FF6B35 0%, #E85521 100%)',
  '/produk/mama-lemon-sabun-cuci-piring-jeruk-nipis-refill-650-g',
  true,
  1
where not exists (select 1 from public.promos limit 1);

insert into public.promos (judul, subjudul, tipe, badge_text, image_url, banner_bg, link_url, is_active, urutan)
select
  'Frisian Flag UHT Cokelat',
  'Susu UHT Nutribrain 6 x 110 ml cuma Rp 24.000',
  'banner',
  'NUTRISI ANAK',
  '/products/1788105762288-zi1d3s.jpeg',
  'linear-gradient(145deg, #2B1810 0%, #452419 100%)',
  '/produk/frisian-flag-nutribrain-susu-uht-cair-cokelat-kotak-6-x-110-ml',
  true,
  2
where (select count(*) from public.promos) = 1;

insert into public.promos (judul, subjudul, tipe, badge_text, image_url, banner_bg, link_url, is_active, urutan)
select
  'Glow & Lovely Foam',
  'Pembersih wajah multivitamin 100g cerahkan kulit',
  'banner',
  'SKINCARE HARIAN',
  '/products/1788105042968-b41tnf.jpeg',
  'linear-gradient(135deg, #FF7E47 0%, #D84315 100%)',
  '/produk/glow-lovely-pembersih-wajah-foam-untuk-kulit-kusam-multivitamin-100-g',
  true,
  3
where (select count(*) from public.promos) = 2;


-- 2. KOLOM PENGIRIMAN, ESTIMASI & POIN DI TABEL ORDERS
alter type public.order_status add value if not exists 'tidak_diambil';

alter table public.orders 
  add column if not exists jarak_km numeric(6,2) default 0,
  add column if not exists ongkir integer default 0,
  add column if not exists alamat_pengiriman text,
  add column if not exists metode_pengiriman text default 'ambil_di_toko',
  add column if not exists poin_digunakan integer default 0,
  add column if not exists diskon_poin integer default 0,
  add column if not exists poin_didapat integer default 0,
  add column if not exists batas_waktu_ambil timestamptz,
  add column if not exists estimasi_menit integer default 15;

alter table public.order_items 
  add column if not exists created_at timestamptz not null default now();


-- 3. KOLOM JAM OPERASIONAL & ESTIMASI PENGANTARAN DI STORE_INFO
alter table public.store_info 
  add column if not exists jam_buka text default '07:00',
  add column if not exists jam_tutup text default '21:00',
  add column if not exists lat numeric(10, 7) default -8.6852,
  add column if not exists long numeric(10, 7) default 116.2758,
  add column if not exists radius_pengantaran_km numeric(5,2) default 10.0,
  add column if not exists ongkir_per_km integer default 2000,
  add column if not exists min_pesanan_antar integer default 20000,
  add column if not exists estimasi_menit_per_km integer default 5,
  add column if not exists estimasi_menit_tambahan integer default 15;


-- 4. TABEL DAFTAR BELANJA / FAVORIT (shopping_lists)
create table if not exists public.shopping_lists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create index if not exists idx_shopping_lists_user on public.shopping_lists(user_id);
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


-- 5. TABEL ALAMAT PENGGUNA (user_addresses)
create table if not exists public.user_addresses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  label           text not null,
  alamat_lengkap  text not null,
  lat             numeric(10, 7),
  long            numeric(10, 7),
  is_default      boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_user_addresses_user_id on public.user_addresses(user_id);
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


-- 6. TABEL ULASAN PRODUK (product_reviews)
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

create index if not exists idx_product_reviews_product_id on public.product_reviews(product_id);
alter table public.product_reviews enable row level security;

drop policy if exists "Semua orang bisa membaca ulasan produk" on public.product_reviews;
create policy "Semua orang bisa membaca ulasan produk"
  on public.product_reviews for select
  using (true);

drop policy if exists "Pengguna login bisa memberi ulasan" on public.product_reviews;
create policy "Pengguna login bisa memberi ulasan"
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


-- 7. TABEL LOYALITAS & POIN (loyalty_config & loyalty_transactions)
create table if not exists public.loyalty_config (
  id                     int primary key default 1 check (id = 1),
  is_active              boolean not null default true,
  threshold_amount       numeric(12,2) not null default 10000,
  points_per_threshold   int not null default 1,
  redeem_rate            numeric(12,2) not null default 100,
  min_order_amount       numeric(12,2) not null default 10000,
  max_redeem_percentage  int not null default 50,
  updated_at             timestamptz not null default now()
);

insert into public.loyalty_config (id) values (1) on conflict (id) do nothing;
alter table public.loyalty_config enable row level security;

drop policy if exists "Anyone can read loyalty config" on public.loyalty_config;
create policy "Anyone can read loyalty config" on public.loyalty_config for select using (true);

drop policy if exists "Admin can update loyalty config" on public.loyalty_config;
create policy "Admin can update loyalty config" on public.loyalty_config for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.loyalty_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  order_id    uuid references public.orders(id) on delete set null,
  points      integer not null,
  type        text not null check (type in ('earned', 'redeemed', 'adjusted')),
  description text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_loyalty_transactions_user_id on public.loyalty_transactions(user_id);
alter table public.loyalty_transactions enable row level security;

drop policy if exists "Users can read own loyalty transactions" on public.loyalty_transactions;
create policy "Users can read own loyalty transactions" on public.loyalty_transactions for select using (auth.uid() = user_id);

drop policy if exists "Users or server can insert loyalty transactions" on public.loyalty_transactions;
create policy "Users or server can insert loyalty transactions" on public.loyalty_transactions for insert with check (auth.uid() = user_id);


-- 8. FUNGSI ATOMIK PENGURANGAN STOK (RACE CONDITION PREVENTION)
create or replace function public.decrement_stock(p_product_id uuid, p_qty int)
returns boolean
language plpgsql
security definer
as $$
declare
  v_updated int;
begin
  update public.products
  set stok = stok - p_qty
  where id = p_product_id and stok >= p_qty;
  
  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;

create or replace function public.increment_stock(p_product_id uuid, p_qty int)
returns void
language plpgsql
security definer
as $$
begin
  update public.products
  set stok = stok + p_qty
  where id = p_product_id;
end;
$$;


-- 9. OTOMATISASI BATAS WAKTU PENGAMBILAN PESANAN (48 JAM)
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
