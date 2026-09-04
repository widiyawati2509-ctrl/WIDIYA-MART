-- Allow users to delete their own orders and order items
drop policy if exists "User hapus pesanan sendiri" on public.orders;
create policy "User hapus pesanan sendiri"
  on public.orders for delete
  using (auth.uid() = user_id);

drop policy if exists "User hapus item pesanan sendiri" on public.order_items;
create policy "User hapus item pesanan sendiri"
  on public.order_items for delete
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );
