-- =========================================================
-- PENGENJEK MART: Transaction Integrity & Security Hardening
-- =========================================================

-- 1. HARDENED RLS FOR PRODUCT REVIEWS: VERIFIED PURCHASE REQUIRED
-- Only users who have purchased the product in a completed order can insert/update reviews
drop policy if exists "Pengguna terautentikasi bisa memberi ulasan" on public.product_reviews;
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

drop policy if exists "Pengguna bisa mengedit ulasannya sendiri" on public.product_reviews;
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
  with check (
    auth.uid() = user_id
  );

-- 2. ATOMIC STOCK DECREMENT RPC FUNCTION
-- Prevents race conditions and overselling by ensuring (stok >= p_qty) in a single atomic statement
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

-- 3. ATOMIC STOCK INCREMENT RPC FUNCTION (for rollback / cancellations)
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
