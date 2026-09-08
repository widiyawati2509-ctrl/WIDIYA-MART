# 🛒 PENGENJEK MART (Widiya Mart) — Aplikasi Toko Online UMKM Modern

Aplikasi web e-commerce progresif & responsif untuk toko kelontong & UMKM retail, terinspirasi oleh standar industri seperti Alfagift & Indomaret Poinku. Dirancang *mobile-first*, super cepat, hemat kuota, dan sangat mudah digunakan oleh pelanggan desa/kelurahan maupun pengelola toko.

Mendukung fleksibilitas penuh: pelanggan dapat memesan online untuk **Ambil di Toko (Store Pickup)** atau **Diantar ke Alamat (Delivery)** dengan metode pembayaran **COD (Cash on Delivery)** atau saldo poin loyalitas.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) dengan TypeScript & React 19
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) dengan Design System 3D Puffy Neumorphic Coral
- **Database, Auth & Realtime**: [Supabase](https://supabase.com/) (PostgreSQL 15+, Row Level Security, Storage Buckets, Realtime Subscriptions)
- **State & Caching**: Server Actions dengan `revalidatePath`, optimistic UI, dan dynamic route protection
- **Icons & Visuals**: [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/)

---

## ✨ Fitur Lengkap Aplikasi

### 📱 Sisi Pelanggan (Customer Experience)

1. **Autentikasi & Akun Aman**:
   - Pendaftaran & Login dengan Email + Password + Nomor HP (WhatsApp terintegrasi).
   - Proteksi sesi aman via Supabase Auth SSR Cookies (`@supabase/ssr`).
   - Profil pengguna dengan saldo poin, total transaksi, dan shortcut navigasi.

2. **Beranda Pintar & Navigasi Mulus**:
   - **Sticky Search Bar Permanen**: Tab pencarian tetap melayang rapi di atas layar (*permanently sticky*) tanpa tertutup saat di-scroll ke bawah.
   - **Header Transisi Halus (1-to-1 Scroll Progress)**: Info nama toko, jam buka, dan alamat memudar secara mulus tanpa sentakan (*zero layout shift*).
   - **Baris Info Ringkas Terpadu**: Alamat kirim dan status toko buka/tutup dirangkum dalam 1 baris kecil hemat ruang vertikal dengan tombol ganti alamat cepat.
   - **Banner Promo Interaktif**: Carousel geser mulus dengan gestur horizontal (*swipe*) ramah layar sentuh (`useSwipeGesture`) tanpa mengganggu scroll vertikal.
   - **Kategori Cepat & Filter Produk**: Pill navigasi horizontal dengan snapping otomatis.
   - **Daftar Produk Ergonomis**: Card compact ber-padding rapat (`p-2.5`, `gap-2`) yang memaksimalkan jumlah produk tampil per layar.

3. **Manajemen Multi-Alamat (`/alamat`)**:
   - Tambah, edit, hapus, dan pilih alamat pengiriman utama.
   - Dilengkapi pin koordinat GPS (Latitude/Longitude) untuk penghitungan jarak otomatis.
   - Modal ganti alamat cepat langsung dari beranda via React Portal.

4. **Katalog & Detail Produk Lanjutan (`/produk/[id]`)**:
   - **Dukungan Varian Produk**: Pilihan ukuran/warna/tipe dengan penyesuaian harga, stok otomatis, dan foto khusus tiap varian.
   - **Galeri Foto Geser Mulus**: Zoom preview dan indikator dot responsif.
   - **Sistem Ulasan & Rating Pelanggan**: Tampilkan ulasan bintang 1-5 dan testimoni pembeli.
   - **Wishlist / Daftar Belanja**: Simpan produk favorit langsung ke `/daftar-belanja`.

5. **Keranjang & Checkout Cerdas (`/keranjang` & `/checkout`)**:
   - Sinkronisasi keranjang ke database Supabase per pengguna.
   - **Pilihan Metode Pemenuhan**:
     - *Ambil di Toko (Pickup)*: Menampilkan jam operasional toko, alamat pengambilan, dan no counter.
     - *Diantar ke Alamat (Delivery)*: Menggunakan formula Haversine untuk kalkulasi jarak presisi dari titik toko, gratis ongkir untuk radius dekat (default $\le 7$ km), dan estimasi waktu sampai otomatis.
   - **Poin Loyalitas & Diskon**: Tukar saldo poin belanja langsung menjadi potongan harga tunai saat checkout.
   - Form catatan khusus kurir/kasir & konfirmasi WhatsApp instan.

6. **Riwayat & Pelacakan Pesanan Real-Time (`/pesanan` & `/pesanan/[id]`)**:
   - Stepper status visual interaktif (*Menunggu Diproses → Sedang Diproses → Siap Diambil/Diantar → Selesai*).
   - Pembaruan status instan via Supabase Realtime tanpa perlu refresh browser.
   - Batas waktu otomatis (auto-cancel deadline) 48 jam untuk pesanan belum diambil/diproses.
   - Tombol bantuan WhatsApp dengan teks pesanan terformat rapi.

---

### 🛠️ Sisi Admin / Pemilik Toko (`/admin`)

1. **Top Bar Mode Admin Terintegrasi Penuh**:
   - Bar oranye cerah `#FF6B35` menyatu penuh sampai ke balik notch/status bar perangkat (`safe-area-inset-top`).
   - Dynamic `theme-color` meta tags sinkron otomatis dengan status login admin.
   - Tombol toggle cepat antara mode pratinjau toko dan panel admin.

2. **Dashboard Real-Time & Laporan Penjualan**:
   - Metrik pesanan masuk hari ini, omzet harian (WITA), dan total omzet keseluruhan.
   - Peringatan stok menipis (< 5 unit) otomatis.
   - Export laporan pesanan ke format CSV dengan filter tanggal berbasis zona waktu lokal WITA (Asia/Makassar, UTC+8).

3. **Manajemen Pesanan & Kasir (`/admin/pesanan`)**:
   - Pemantauan pesanan masuk real-time dengan notifikasi visual.
   - Ubah status pesanan (*Menunggu Diproses*, *Sedang Diproses*, *Siap Diambil*, *Selesai*, *Batalkan*).
   - **Cetak Struk Thermal Kasir (58mm POS)**: Format cetak struk kasir profesional langsung ke printer bluetooth/USB thermal 58mm tanpa elemen web yang bocor.
   - Pengembalian stok dan poin loyalitas otomatis jika pesanan dibatalkan.

4. **Manajemen Produk & Varian (`/admin/produk`)**:
   - Tambah/edit produk dengan multi-gambar via Supabase Storage.
   - Atur varian (nama varian, harga varian, stok varian, gambar varian).
   - Toggle status aktif/nonaktif produk seketika.

5. **Manajemen Kategori (`/admin/kategori`)**:
   - Buat dan kelola kategori produk lengkap dengan auto-slug generator.

6. **Pengaturan Poin Loyalitas (`/admin/poin`)**:
   - Atur rasio belanja terhadap poin yang didapat (contoh: tiap belanja Rp 10.000 dapat 10 poin).
   - Atur nilai tukar rupiah per 1 poin loyalitas.
   - Audit riwayat perolehan & penukaran poin seluruh pelanggan.

7. **Pengaturan Toko & Pengiriman (`/admin/pengaturan`)**:
   - Atur koordinat GPS toko (Latitude/Longitude).
   - Konfigurasi jam operasional (buka & tutup).
   - Atur radius pengiriman maksimal, radius bebas ongkir, dan tarif ongkir per kilometer.
   - Kelola nomor telepon dan tautan WhatsApp resmi toko.

---

## 🗄️ Database & Skema Supabase

Skema database lengkap terdiri dari 12 tabel terintegrasi dengan proteksi Row Level Security (RLS) dan fungsi stok atomik:

| Tabel | Deskripsi |
|---|---|
| `profiles` | Profil akun pengguna dan penetapan role (`admin` / `customer`) |
| `categories` | Kategori produk dengan slug dan urutan tampilan |
| `products` | Katalog produk, harga dasar, stok dasar, dan foto utama |
| `product_variants` | Varian produk spesifik (harga, stok, nama, foto) |
| `product_reviews` | Rating bintang dan teks testimoni pembeli |
| `orders` | Header pesanan, metode pengiriman, ongkir, diskon poin, total bayar |
| `order_items` | Detail baris barang pesanan beserta varian yang dipilih |
| `store_info` | Konfigurasi toko, jam operasional, koordinat, dan tarif delivery |
| `promos` | Banner promosi beranda dan kode voucher |
| `user_addresses` | Buku alamat pelanggan lengkap dengan koordinat GPS |
| `shopping_lists` | Wishlist / daftar belanja produk pengguna |
| `loyalty_config` & `loyalty_transactions` | Konfigurasi poin dan buku besar mutasi poin pengguna |

Untuk pemulihan darurat satu klik, gunakan file master:
```
backups/MASTER_SUPABASE_DISASTER_RECOVERY.sql
```

---

## ⚙️ Menjalankan di Lingkungan Lokal

1. **Clone repository**:
   ```bash
   git clone git@github.com:widiyawati2509-ctrl/WIDIYA-MART.git
   cd WIDIYA-MART
   ```

2. **Setup environment variables**:
   Buat file `.env.local` di folder root proyek:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```

3. **Install dependensi**:
   ```bash
   npm install
   ```

4. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

5. **Build & Test Produksi**:
   ```bash
   npm run build
   npm run start
   ```

---

## 📄 Standar Dokumentasi Terkait

- **[DESIGN.md](file:///Users/kharismabahtiar/Projects/baru/widiya-mart/DESIGN.md)**: Panduan sistem desain, palet warna, tipografi, token jarak (compact layout), dan spesifikasi gestur.
- **[PANDUAN_PEMULIHAN_BENCANA.md](file:///Users/kharismabahtiar/Projects/baru/widiya-mart/PANDUAN_PEMULIHAN_BENCANA.md)**: Prosedur pemulihan database, checkpoint git, dan arsip backup.
