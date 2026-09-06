-- =========================================================================
-- WIDIYA MART / PENGENJEK MART — MASTER DISASTER RECOVERY DATABASE SCRIPT
-- =========================================================================
-- Skrip ini adalah cadangan darurat LENGKAP untuk seluruh struktur basis data.
-- Jika database Supabase terhapus, rusak, atau Anda berpindah project baru:
-- 1. Buka Supabase Dashboard -> SQL Editor
-- 2. Buat "New Query", paste seluruh isi skrip ini
-- 3. Klik "Run" (Selesai dalam hitungan detik!)
--
-- Sifat: IDEMPOTENT (Aman dijalankan berkali-kali tanpa merusak data yang ada).
-- Tanggal Backup: 2026-09-06
-- =========================================================================

-- 1. EKSTENSI & ENUM
create extension if not exists "uuid-ossp";

do $$ begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'menunggu_diproses',
      'diproses',
      'siap_diambil',
      'selesai',
      'dibatalkan',
      'tidak_diambil'
    );
  else
    alter type public.order_status add value if not exists 'tidak_diambil';
  end if;
end $$;

-- 2. TABEL PROFIL PENGGUNA (profiles)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nama       text not null default '',
  no_hp      text,
  role       text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

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

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nama, no_hp)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nama', ''),
    coalesce(new.raw_user_meta_data->>'no_hp', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. TABEL KATEGORI PRODUK (categories)
create table if not exists public.categories (
  id         uuid primary key default uuid_generate_v4(),
  nama       text not null,
  slug       text not null unique,
  icon_url   text,
  urutan     int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "Semua bisa lihat kategori" on public.categories;
create policy "Semua bisa lihat kategori"
  on public.categories for select using (true);

drop policy if exists "Admin kelola kategori" on public.categories;
create policy "Admin kelola kategori"
  on public.categories for all
  using (public.is_admin());

-- 4. TABEL PRODUK (products)
create table if not exists public.products (
  id           uuid primary key default uuid_generate_v4(),
  nama         text not null,
  slug         text not null unique,
  deskripsi    text,
  harga        numeric(12,2) not null check (harga >= 0),
  stok         int not null default 0 check (stok >= 0),
  category_id  uuid references public.categories(id) on delete set null,
  image_url    text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Semua bisa lihat produk aktif" on public.products;
create policy "Semua bisa lihat produk aktif"
  on public.products for select
  using (is_active = true);

drop policy if exists "Admin kelola produk" on public.products;
create policy "Admin kelola produk"
  on public.products for all
  using (public.is_admin());

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

-- 5. TABEL INFORMASI TOKO & OPERASIONAL (store_info)
create table if not exists public.store_info (
  id                      int primary key default 1 check (id = 1),
  nama_toko               text not null default 'Widiya Mart',
  alamat_toko             text not null default 'Jl. Raya Desa Pengenjek, Lombok Tengah',
  kota                    text not null default 'Lombok Tengah',
  jam_operasional         text not null default 'Senin–Minggu, 07.00–21.00',
  jam_buka                text default '07:00',
  jam_tutup               text default '21:00',
  no_hp_toko              text default '081234567890',
  whatsapp                text default '6281234567890',
  maps_url                text,
  logo_url                text,
  lat                     numeric(10, 7) default -8.6852,
  long                    numeric(10, 7) default 116.2758,
  radius_pengantaran_km   numeric(5,2) default 10.0,
  ongkir_per_km           integer default 2000,
  min_pesanan_antar       integer default 20000,
  estimasi_menit_per_km   integer default 5,
  estimasi_menit_tambahan integer default 15,
  promos_data             jsonb default '[]'::jsonb,
  updated_at              timestamptz not null default now()
);

alter table public.store_info enable row level security;

drop policy if exists "Semua bisa lihat info toko" on public.store_info;
create policy "Semua bisa lihat info toko"
  on public.store_info for select using (true);

drop policy if exists "Admin update info toko" on public.store_info;
create policy "Admin update info toko"
  on public.store_info for all
  using (public.is_admin());

insert into public.store_info (id, nama_toko, alamat_toko, kota, whatsapp)
values (1, 'Widiya Mart', 'Jl. Raya Desa Pengenjek, Lombok Tengah', 'Lombok Tengah', '6281234567890')
on conflict (id) do nothing;

-- 6. TABEL PROMO & BANNER BERANDA (promos)
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

-- 7. TABEL ALAMAT LENGKAP & TITIK LOKASI (user_addresses)
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
create policy "Users can view their own addresses" on public.user_addresses for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own addresses" on public.user_addresses;
create policy "Users can insert their own addresses" on public.user_addresses for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can update their own addresses" on public.user_addresses;
create policy "Users can update their own addresses" on public.user_addresses for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own addresses" on public.user_addresses;
create policy "Users can delete their own addresses" on public.user_addresses for delete to authenticated using (auth.uid() = user_id);

-- 8. TABEL KERANJANG (carts & cart_items)
create table if not exists public.carts (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id)
);

alter table public.carts enable row level security;

drop policy if exists "User akses keranjang sendiri" on public.carts;
create policy "User akses keranjang sendiri" on public.carts for all using (auth.uid() = user_id);

create table if not exists public.cart_items (
  id         uuid primary key default uuid_generate_v4(),
  cart_id    uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  qty        int not null default 1 check (qty > 0),
  created_at timestamptz not null default now(),
  unique(cart_id, product_id)
);

alter table public.cart_items enable row level security;

drop policy if exists "User akses item keranjang sendiri" on public.cart_items;
create policy "User akses item keranjang sendiri" on public.cart_items for all
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

-- 9. TABEL PESANAN & ITEM (orders & order_items)
create table if not exists public.orders (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete restrict,
  status              public.order_status not null default 'menunggu_diproses',
  subtotal            numeric(14,2) not null check (subtotal >= 0),
  total               numeric(14,2) not null check (total >= 0),
  catatan             text,
  nama_pemesan        text not null,
  no_hp_pemesan       text not null,
  metode_pengiriman   text default 'ambil_di_toko',
  alamat_pengiriman   text,
  jarak_km            numeric(6,2) default 0,
  ongkir              integer default 0,
  poin_digunakan      integer default 0,
  diskon_poin         integer default 0,
  poin_didapat        integer default 0,
  batas_waktu_ambil   timestamptz,
  estimasi_menit      integer default 15,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "User lihat pesanan sendiri" on public.orders;
create policy "User lihat pesanan sendiri" on public.orders for select using (auth.uid() = user_id);

drop policy if exists "User buat pesanan" on public.orders;
create policy "User buat pesanan" on public.orders for insert with check (auth.uid() = user_id);

drop policy if exists "Admin kelola semua pesanan" on public.orders;
create policy "Admin kelola semua pesanan" on public.orders for all using (public.is_admin());

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

-- Auto-set 48-jam batas ambil ketika status berubah menjadi siap_diambil
create or replace function public.set_order_pickup_deadline()
returns trigger language plpgsql as $$
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
  for each row execute function public.set_order_pickup_deadline();

create table if not exists public.order_items (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  product_id      uuid references public.products(id) on delete set null,
  nama_produk     text not null,
  harga_saat_beli numeric(12,2) not null,
  qty             int not null check (qty > 0),
  subtotal        numeric(14,2) not null,
  created_at      timestamptz not null default now()
);

alter table public.order_items enable row level security;

drop policy if exists "User lihat item pesanan sendiri" on public.order_items;
create policy "User lihat item pesanan sendiri" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

drop policy if exists "User buat item pesanan" on public.order_items;
create policy "User buat item pesanan" on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

drop policy if exists "Admin kelola semua item pesanan" on public.order_items;
create policy "Admin kelola semua item pesanan" on public.order_items for all using (public.is_admin());

-- 10. TABEL WISHLIST / DAFTAR BELANJA (shopping_lists)
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
create policy "User kelola daftar belanja sendiri" on public.shopping_lists for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Admin akses semua daftar belanja" on public.shopping_lists;
create policy "Admin akses semua daftar belanja" on public.shopping_lists for select using (public.is_admin());

-- 11. TABEL ULASAN & PENILAIAN PRODUK (product_reviews)
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
create policy "Semua orang bisa membaca ulasan produk" on public.product_reviews for select using (true);

drop policy if exists "Pengguna login bisa memberi ulasan" on public.product_reviews;
create policy "Pengguna login bisa memberi ulasan" on public.product_reviews for insert
  to authenticated with check (auth.uid() = user_id);

drop policy if exists "Pengguna bisa mengedit ulasannya sendiri" on public.product_reviews;
create policy "Pengguna bisa mengedit ulasannya sendiri" on public.product_reviews for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Pengguna atau admin bisa menghapus ulasan" on public.product_reviews;
create policy "Pengguna atau admin bisa menghapus ulasan" on public.product_reviews for delete
  to authenticated using (auth.uid() = user_id or public.is_admin());

-- 12. TABEL LOYALITAS / POIN REWARD (loyalty_config & loyalty_transactions)
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

-- 13. RPC ATOMIK UNTUK INTEGRITAS STOK (RACE-CONDITION RESISTANT)
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

-- 14. SUPABASE STORAGE (BUCKET 'products')
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "Public bisa lihat foto produk" on storage.objects;
create policy "Public bisa lihat foto produk" on storage.objects for select using (bucket_id = 'products');

drop policy if exists "Admin upload foto produk" on storage.objects;
create policy "Admin upload foto produk" on storage.objects for insert with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "Admin hapus foto produk" on storage.objects;
create policy "Admin hapus foto produk" on storage.objects for delete using (bucket_id = 'products' and public.is_admin());

-- 15. SEED DATA DASAR (KATEGORI)
insert into public.categories (nama, slug, urutan) values
  ('Sembako',    'sembako',    1),
  ('Minuman',    'minuman',    2),
  ('Snack',      'snack',      3),
  ('Kebersihan', 'kebersihan', 4),
  ('Perawatan',  'perawatan',  5),
  ('Lainnya',    'lainnya',    99)
on conflict (slug) do nothing;

-- =========================================================================
-- SELESAI! SEMUA STRUKTUR DATABASE SIAP 100%
-- =========================================================================
