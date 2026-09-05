-- =========================================================================
-- PENGENJEK MART: FULL CONSOLIDATED SQL MIGRATION
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. TAMBAH KOLOM PENGIRIMAN & POIN PADA TABEL ORDERS
alter table public.orders 
  add column if not exists jarak_km numeric(6,2) default 0,
  add column if not exists ongkir integer default 0,
  add column if not exists alamat_pengiriman text,
  add column if not exists metode_pengiriman text default 'ambil_di_toko',
  add column if not exists poin_digunakan integer default 0,
  add column if not exists diskon_poin integer default 0,
  add column if not exists poin_didapat integer default 0;

-- 2. TABEL ALAMAT TERSIMPAN (user_addresses)
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

-- 3. TABEL ULASAN PRODUK (product_reviews)
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

alter table public.product_reviews enable row level security;

drop policy if exists "Semua orang bisa membaca ulasan produk" on public.product_reviews;
create policy "Semua orang bisa membaca ulasan produk"
  on public.product_reviews for select
  using (true);

drop policy if exists "Pengguna yang membeli produk bisa memberi ulasan" on public.product_reviews;
create policy "Pengguna yang membeli produk bisa memberi ulasan"
  on public.product_reviews for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.user_id = auth.uid()
        and o.status = 'selesai'
        and oi.product_id = product_reviews.product_id
    )
  );

drop policy if exists "Pengguna bisa mengedit ulasannya sendiri jika sudah membeli" on public.product_reviews;
create policy "Pengguna bisa mengedit ulasannya sendiri jika sudah membeli"
  on public.product_reviews for update
  to authenticated
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.user_id = auth.uid()
        and o.status = 'selesai'
        and oi.product_id = product_reviews.product_id
    )
  )
  with check (auth.uid() = user_id);

drop policy if exists "Pengguna atau admin bisa menghapus ulasan" on public.product_reviews;
create policy "Pengguna atau admin bisa menghapus ulasan"
  on public.product_reviews for delete
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

-- 4. FUNGSI ATOMIK PENGURANGAN STOK (RACE CONDITION PREVENTION)
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

-- 5. TABEL LOYALITAS & POIN (loyalty_config & loyalty_transactions)
create table if not exists public.loyalty_config (
  id int primary key default 1 check (id = 1),
  is_active boolean not null default true,
  earn_rate_percentage numeric(5,2) not null default 1.0,
  redeem_rate integer not null default 100,
  min_order_to_earn integer not null default 10000,
  max_redeem_percentage integer not null default 50,
  updated_at timestamptz not null default now()
);

insert into public.loyalty_config (id) values (1) on conflict (id) do nothing;
alter table public.loyalty_config enable row level security;
drop policy if exists "Anyone can read loyalty config" on public.loyalty_config;
create policy "Anyone can read loyalty config" on public.loyalty_config for select using (true);
drop policy if exists "Admin can update loyalty config" on public.loyalty_config;
create policy "Admin can update loyalty config" on public.loyalty_config for update using (public.is_admin());

create table if not exists public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  points integer not null,
  type text not null check (type in ('earned', 'redeemed', 'adjusted')),
  description text,
  created_at timestamptz not null default now()
);

alter table public.loyalty_transactions enable row level security;
drop policy if exists "Users can read own loyalty transactions" on public.loyalty_transactions;
create policy "Users can read own loyalty transactions" on public.loyalty_transactions for select using (auth.uid() = user_id);
drop policy if exists "Users or server can insert loyalty transactions" on public.loyalty_transactions;
create policy "Users or server can insert loyalty transactions" on public.loyalty_transactions for insert with check (auth.uid() = user_id);
