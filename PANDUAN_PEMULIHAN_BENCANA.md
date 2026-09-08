# 🛡️ PANDUAN LENGKAP PEMULIHAN BENCANA (DISASTER RECOVERY GUIDE)
**Widiya Mart / Pengenjek Mart**  
*Tanggal Pembuatan Cadangan: 6 September 2026*

Dokumen ini adalah panduan langkah demi langkah jika terjadi hal-hal di luar kendali (kode rusak, salah edit, database terhapus, laptop berganti, atau server bermasalah).

---

## 📦 1. Ringkasan Aset Cadangan (Backup Bundles)

Semua komponen penting telah dicadangkan dan diverifikasi:

| No | Komponen Cadangan | Lokasi / Identifier | Keterangan |
|---|---|---|---|
| 1 | **Arsip Kode Lengkap** | `BACKUP_WIDIYA_MART_20260906.zip` *(23 MB)* | Berisi seluruh source code, aset gambar, ikon, dan konfigurasi tanpa folder temporary. |
| 2 | **Master Database SQL** | `MASTER_SUPABASE_DISASTER_RECOVERY.sql` | 1 skrip SQL tunggal untuk membangkitkan ulang seluruh 12 tabel, fungsi stok atomik, RLS, dan storage. |
| 3 | **Git Rollback Tag** | Tag: `v1.0-stable-20260906` | Checkpoint stabil di GitHub remote (`git@github.com:widiyawati2509-ctrl/WIDIYA-MART.git`). |
| 4 | **Dokumentasi Desain** | `widiya-mart/DESIGN.md` | Standar token warna, tipografi, dan arsitektur UI/UX toko. |

---

## 🚨 2. Skenario Pemulihan & Solusi Instan

### Skenario A: Salah Edit Kode / Aplikasi Mengalami Bug Baru
Jika Anda atau developer lain melakukan perubahan yang merusak aplikasi dan ingin kembali 100% ke kondisi sekarang:

```bash
cd widiya-mart
# 1. Batalkan semua perubahan yang belum disimpan
git reset --hard v1.0-stable-20260906

# 2. Bersihkan file-file sementara baru jika ada
git clean -fd

# 3. Tes build ulang
npm run build
```
*(Aplikasi akan seketika kembali normal seperti saat checkpoint ini dibuat).*

---

### Skenario B: Ganti Laptop / Harddisk Rusak / Folder Terhapus
Jika seluruh folder proyek di komputer hilang atau Anda ingin memindahkan ke laptop/server baru:

#### Opsi 1 (Menggunakan file ZIP):
1. Copy file `BACKUP_WIDIYA_MART_20260906.zip` ke laptop baru.
2. Unzip arsip tersebut:
   ```bash
   unzip BACKUP_WIDIYA_MART_20260906.zip
   cd widiya-mart
   ```
3. Pasang dependency dan build:
   ```bash
   npm install
   npm run build
   npm run start
   ```

#### Opsi 2 (Menggunakan Git Clone dari GitHub):
```bash
git clone git@github.com:widiyawati2509-ctrl/WIDIYA-MART.git
cd WIDIYA-MART
git checkout v1.0-stable-20260906
npm install
npm run build
```

> **Catatan Kredensial (.env.local):**  
> Buat file `.env.local` di dalam folder `widiya-mart` dengan isi kredensial Supabase Anda:
> ```env
> NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
> NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-anda>
> ```

---

### Skenario C: Database Supabase Rusak / Terhapus / Ingin Buat Supabase Baru
Jika database Supabase bermasalah atau Anda membuat akun/project baru di Supabase:

1. Masuk ke **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Pilih project Anda.
3. Di bilah samping kiri, klik **SQL Editor** (`>_`).
4. Klik **New Query**.
5. Buka file `MASTER_SUPABASE_DISASTER_RECOVERY.sql`, copy seluruh teksnya (Ctrl+A / Cmd+A, lalu Ctrl+C / Cmd+C).
6. Paste ke dalam editor Supabase, lalu klik tombol hijau **Run** (atau tekan `Ctrl+Enter`).
7. **Selesai!** Seluruh 12 tabel, aturan keamanan RLS, trigger batas waktu 48 jam, bucket foto produk, dan fungsi stok atomik aktif dalam 3-5 detik.

---

## 🔒 3. Daftar Tabel & Fitur Database yang Dipulihkan
Skrip `MASTER_SUPABASE_DISASTER_RECOVERY.sql` otomatis mencakup:
- **`profiles`**: Autentikasi user & role admin.
- **`categories`**: Kategori produk dengan auto-seed (Sembako, Minuman, Snack, dll).
- **`products`**: Katalog produk, harga, stok, foto, dan status aktif.
- **`product_variants`**: Varian spesifik produk (nama, harga khusus, stok khusus, foto khusus).
- **`orders`**: Pesanan lengkap dengan sistem delivery (jarak_km, ongkir, estimasi_menit, deadline 48 jam, potongan poin loyalty).
- **`order_items`**: Detail produk tiap pesanan beserta varian terpilih.
- **`store_info`**: Konfigurasi toko, radius antar, ongkir per km, jam buka-tutup (07:00 - 21:00).
- **`promos`**: Banner beranda dan voucher promo.
- **`user_addresses`**: Alamat pelanggan dengan koordinat GPS lat/long.
- **`shopping_lists`**: Fitur wishlist / daftar belanja user.
- **`product_reviews`**: Rating bintang 1-5 dan teks ulasan pelanggan.
- **`loyalty_config` & `loyalty_transactions`**: Sistem poin belanja dan cashback.
- **`decrement_stock` & `increment_stock`**: Proteksi anti balapan stok (race-condition proof).

---
*Cadangan ini dibuat dalam kondisi sistem lulus uji QA, audit kesehatan kode, dan build production 0 error.*
