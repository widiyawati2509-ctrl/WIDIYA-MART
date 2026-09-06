-- =========================================================================
-- PENGENJEK MART: MIGRATION TABEL PROMO (promos)
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =========================================================================

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

-- Index untuk performa query
create index if not exists idx_promos_is_active_urutan on public.promos(is_active, urutan);

-- Enable Row Level Security (RLS)
alter table public.promos enable row level security;

-- 1. Siapa saja (termasuk publik / guest) bisa membaca promo yang aktif
drop policy if exists "Semua bisa baca promo aktif" on public.promos;
create policy "Semua bisa baca promo aktif"
  on public.promos for select
  using (true);

-- 2. Admin memiliki izin penuh (INSERT, UPDATE, DELETE, SELECT)
drop policy if exists "Admin kelola semua promo" on public.promos;
create policy "Admin kelola semua promo"
  on public.promos for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed initial promo banners (hanya jika tabel masih kosong)
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
