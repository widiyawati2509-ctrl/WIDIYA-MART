-- =========================================================
-- PENGENJEK MART: Delivery Time Estimation (Antar Alamat)
-- =========================================================

-- 1. ADD estimasi_menit_per_km & estimasi_menit_tambahan TO STORE_INFO TABLE
alter table public.store_info 
  add column if not exists estimasi_menit_per_km integer default 5,
  add column if not exists estimasi_menit_tambahan integer default 15;

-- 2. ADD estimasi_menit TO ORDERS TABLE
alter table public.orders 
  add column if not exists estimasi_menit integer;
