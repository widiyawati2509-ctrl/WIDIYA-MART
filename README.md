# 🛒 Widiya Mart — Aplikasi Toko Online UMKM

Aplikasi web e-commerce untuk toko kelontong & UMKM, terinspirasi oleh Alfagift. Dirancang mobile-first, cepat, dan mudah digunakan untuk pelanggan serta pengelola toko.

Pelanggan memesan secara online, mengambil pesanan langsung di toko (store pickup), dan membayar menggunakan metode **COD (Cash on Delivery)** saat barang diambil.

---

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security + Storage)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/)

---

## ✨ Fitur Utama

### 📱 Sisi Pelanggan (Customer)
1. **Autentikasi**:
   - Pendaftaran & Login dengan Email + Password + Nomor HP
   - Proteksi sesi aman via Supabase Auth SSR cookies
2. **Katalog Produk**:
   - Beranda dengan banner, kategori cepat, dan produk terbaru
   - Pencarian produk real-time & filter kategori horizontal
   - Halaman detail produk lengkap dengan info stok, deskripsi, & produk terkait
3. **Keranjang Belanja**:
   - Tambah/kurang kuantitas, hapus item, ringkasan subtotal otomatis
   - Keranjang tersimpan di database Supabase per pengguna
4. **Checkout (Ambil di Toko & COD)**:
   - Menampilkan informasi toko (alamat lengkap, kota, jam operasional, kontak toko)
   - Metode pembayaran COD (Bayar saat ambil)
   - Pengisian form pemesan (nama, no HP, catatan pesanan)
5. **Riwayat & Pelacakan Pesanan**:
   - Daftar pesanan pengguna dengan badge status interaktif
   - Visual progress stepper status: *Menunggu Diproses → Sedang Diproses → Siap Diambil → Selesai*
   - Tautan langsung WhatsApp toko untuk kemudahan konfirmasi
6. **Profil Pengguna**:
   - Ringkasan profil dan riwayat belanja
   - Tombol logout cepat

### 🛠️ Sisi Admin / Pemilik Toko (`/admin`)
1. **Dashboard Metrik**:
   - Jumlah pesanan masuk hari ini
   - Omzet harian & total omzet
   - Peringatan stok produk menipis (< 5 item)
   - Daftar pesanan terbaru
2. **Manajemen Produk (`/admin/produk`)**:
   - Tambah produk dengan upload foto langsung ke Supabase Storage
   - Edit produk langsung (nama, harga, stok, kategori, status aktif/nonaktif)
   - Nonaktifkan produk
3. **Manajemen Kategori (`/admin/kategori`)**:
   - Tambah kategori baru dengan auto-slug
   - Hapus kategori
4. **Manajemen Pesanan (`/admin/pesanan`)**:
   - Pantau semua pesanan masuk dari pelanggan
   - Ubah status pesanan (*Menunggu Diproses*, *Sedang Diproses*, *Siap Diambil*, *Selesai*, *Batalkan*)
5. **Pengaturan Toko (`/admin/pengaturan`)**:
   - Edit nama toko, alamat, kota, jam operasional, nomor telepon, nomor WhatsApp, dan link Google Maps

---

## 🗄️ Setup Database Supabase

1. Buka dashboard Supabase: [https://supabase.com/dashboard/project/byhpcdgehartffitbrde/sql](https://supabase.com/dashboard/project/byhpcdgehartffitbrde/sql)
2. Buat query baru, lalu salin seluruh isi file:
   ```
   supabase/migrations/20260903000000_initial_schema.sql
   ```
3. Klik **Run** untuk mengeksekusi skema tabel, fungsi trigger, RLS policies, storage bucket `products`, dan seed kategori awal.

### Menjadikan Akun sebagai Admin:
Setelah mendaftar akun di aplikasi, ubah peran akun Anda menjadi admin via SQL editor Supabase:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'USER_UUID_DARI_AUTH';
```

---

## ⚙️ Menjalankan di Lokal

1. Salin konfigurasi environment:
   ```bash
   cp .env.example .env.local
   ```
2. Pastikan file `.env.local` berisi:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://byhpcdgehartffitbrde.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Install dependensi:
   ```bash
   npm install
   ```
4. Jalankan development server:
   ```bash
   npm run dev
   ```
5. Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 📦 Build Produksi

```bash
npm run build
npm run start
```
