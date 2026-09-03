-- =========================================================
-- Widiya Mart — Initial Schema + RLS
-- =========================================================

-- ── Extensions ──────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── profiles ────────────────────────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nama       text not null default '',
  no_hp      text,
  role       text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "User lihat profil sendiri"
  on public.profiles for select
  using (auth.uid() = id);

create policy "User update profil sendiri"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admin akses semua profil"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nama, no_hp)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nama', ''),
    coalesce(new.raw_user_meta_data->>'no_hp', null)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── categories ──────────────────────────────────────────
create table public.categories (
  id        uuid primary key default uuid_generate_v4(),
  nama      text not null,
  slug      text not null unique,
  icon_url  text,
  urutan    int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Semua bisa lihat kategori"
  on public.categories for select using (true);

create policy "Admin kelola kategori"
  on public.categories for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ── products ────────────────────────────────────────────
create table public.products (
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

create policy "Semua bisa lihat produk aktif"
  on public.products for select
  using (is_active = true);

create policy "Admin kelola produk"
  on public.products for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

-- ── addresses ───────────────────────────────────────────
create table public.addresses (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  label          text not null default 'Rumah',
  alamat_lengkap text not null,
  kota           text not null,
  kode_pos       text,
  is_default     boolean not null default false,
  created_at     timestamptz not null default now()
);

alter table public.addresses enable row level security;

create policy "User kelola alamat sendiri"
  on public.addresses for all
  using (auth.uid() = user_id);

create policy "Admin lihat semua alamat"
  on public.addresses for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ── carts + cart_items ──────────────────────────────────
create table public.carts (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id)
);

alter table public.carts enable row level security;

create policy "User akses keranjang sendiri"
  on public.carts for all
  using (auth.uid() = user_id);

create table public.cart_items (
  id         uuid primary key default uuid_generate_v4(),
  cart_id    uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  qty        int not null default 1 check (qty > 0),
  created_at timestamptz not null default now(),
  unique(cart_id, product_id)
);

alter table public.cart_items enable row level security;

create policy "User akses item keranjang sendiri"
  on public.cart_items for all
  using (
    exists (
      select 1 from public.carts c
      where c.id = cart_id and c.user_id = auth.uid()
    )
  );

-- ── orders ──────────────────────────────────────────────
create type public.order_status as enum (
  'menunggu_diproses',
  'diproses',
  'siap_diambil',
  'selesai',
  'dibatalkan'
);

create table public.orders (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete restrict,
  status       public.order_status not null default 'menunggu_diproses',
  subtotal     numeric(14,2) not null check (subtotal >= 0),
  total        numeric(14,2) not null check (total >= 0),
  catatan      text,
  nama_pemesan text not null,
  no_hp_pemesan text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "User lihat pesanan sendiri"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "User buat pesanan"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Admin kelola semua pesanan"
  on public.orders for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

-- ── order_items ─────────────────────────────────────────
create table public.order_items (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  product_id      uuid references public.products(id) on delete set null,
  nama_produk     text not null,
  harga_saat_beli numeric(12,2) not null,
  qty             int not null check (qty > 0),
  subtotal        numeric(14,2) not null
);

alter table public.order_items enable row level security;

create policy "User lihat item pesanan sendiri"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "User buat item pesanan"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "Admin kelola semua item pesanan"
  on public.order_items for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ── store_info ──────────────────────────────────────────
create table public.store_info (
  id               int primary key default 1 check (id = 1), -- singleton
  nama_toko        text not null default 'Widiya Mart',
  alamat_toko      text not null default '',
  kota             text not null default '',
  jam_operasional  text not null default 'Senin–Minggu, 07.00–21.00',
  no_hp_toko       text,
  whatsapp         text,
  maps_url         text,
  logo_url         text,
  updated_at       timestamptz not null default now()
);

alter table public.store_info enable row level security;

create policy "Semua bisa lihat info toko"
  on public.store_info for select using (true);

create policy "Admin update info toko"
  on public.store_info for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Seed default store info
insert into public.store_info (id, nama_toko) values (1, 'Widiya Mart')
  on conflict (id) do nothing;

-- ── Storage bucket ──────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "Public bisa lihat foto produk"
  on storage.objects for select
  using (bucket_id = 'products');

create policy "Admin upload foto produk"
  on storage.objects for insert
  with check (
    bucket_id = 'products'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admin hapus foto produk"
  on storage.objects for delete
  using (
    bucket_id = 'products'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ── Seed categories ─────────────────────────────────────
insert into public.categories (nama, slug, urutan) values
  ('Sembako',    'sembako',    1),
  ('Minuman',    'minuman',    2),
  ('Snack',      'snack',      3),
  ('Kebersihan', 'kebersihan', 4),
  ('Perawatan',  'perawatan',  5),
  ('Lainnya',    'lainnya',    99)
on conflict (slug) do nothing;
