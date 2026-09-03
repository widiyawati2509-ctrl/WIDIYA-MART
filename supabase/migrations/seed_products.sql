-- =========================================================
-- Widiya Mart — Sample Products Seed
-- Jalankan di Supabase SQL Editor jika ingin mengisi produk contoh
-- =========================================================

do $$
declare
  cat_sembako uuid;
  cat_minuman uuid;
  cat_snack uuid;
  cat_kebersihan uuid;
  cat_perawatan uuid;
begin
  select id into cat_sembako from public.categories where slug = 'sembako' limit 1;
  select id into cat_minuman from public.categories where slug = 'minuman' limit 1;
  select id into cat_snack from public.categories where slug = 'snack' limit 1;
  select id into cat_kebersihan from public.categories where slug = 'kebersihan' limit 1;
  select id into cat_perawatan from public.categories where slug = 'perawatan' limit 1;

  insert into public.products (nama, slug, deskripsi, harga, stok, category_id, is_active) values
    ('Beras Rojolele Super 5kg', 'beras-rojolele-5kg', 'Beras pulen pilihan keluarga kualitas premium, bersih dan wangi alami.', 72000, 25, cat_sembako, true),
    ('Minyak Goreng Sania 2L', 'minyak-goreng-sania-2l', 'Minyak goreng kelapa sawit murni berkualitas tinggi dua kali penyaringan.', 36000, 30, cat_sembako, true),
    ('Indomie Goreng Spesial 85g', 'indomie-goreng-spesial-85g', 'Mie instan goreng favorit nusantara dengan bumbu gurih nikmat.', 3500, 100, cat_sembako, true),
    ('Teh Botol Sosro 350ml', 'teh-botol-sosro-350ml', 'Minuman teh melati segar kemasan botol praktis diminum dingin.', 4500, 40, cat_minuman, true),
    ('Kopi Kapal Api Spesial Mix 10x24g', 'kopi-kapal-api-mix', 'Paduan kopi bubuk pilihan dengan gula murni beraroma mantap.', 15000, 20, cat_minuman, true),
    ('Chitato Sapi Panggang 68g', 'chitato-sapi-panggang-68g', 'Keripik kentang bergelombang dengan rasa daging sapi panggang gurih renyah.', 12500, 15, cat_snack, true),
    ('Sunlight Pencuci Piring Jeruk Nipis 750ml', 'sunlight-jeruk-nipis-750ml', 'Sabun cuci piring konsentrat ekstrak jeruk nipis asli ampuh bersihkan lemak.', 16000, 18, cat_kebersihan, true),
    ('Sabun Mandi Lifebuoy Total 10 110g', 'lifebuoy-total-10', 'Sabun batang perlindungan kuman dan bakteri dengan formula antibakterial.', 5000, 50, cat_perawatan, true)
  on conflict (slug) do update set
    harga = excluded.harga,
    stok = excluded.stok,
    is_active = excluded.is_active;
end $$;
