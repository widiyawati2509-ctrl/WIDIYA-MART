# Widiya Mart - Android Studio Project (APK)

Proyek Android Studio resmi untuk aplikasi **Widiya Mart** (Toko Kita Theme).

---

## 📱 Fitur APK Ini

1. **WebView Modern & Cepat**: Mengarah ke `https://widiya-mart.vercel.app` dengan integrasi DOM Storage & LocalStorage (sesi login Supabase tersimpan permanen).
2. **Handle WhatsApp Otomatis**: Tombol *"Hubungi via WhatsApp"* dan link nomor telepon otomatis membuka aplikasi WhatsApp / Telepon di HP pengguna.
3. **Handle Tombol Back Android**: Menekan tombol kembali di HP akan memundurkan halaman web, dan konfirmasi *"Tekan sekali lagi untuk keluar"* jika sudah di beranda.
4. **Pull to Refresh (SwipeRefreshLayout)**: Tarik layar ke bawah untuk memuat ulang halaman dengan aksen warna Coral khas Widiya Mart.
5. **Dukungan Upload File / Gambar (File Chooser)**: Admin dapat memilih foto langsung dari galeri HP saat menambah atau mengedit produk.
6. **Layar Offline Terpadu**: Jika internet terputus, menampilkan tampilan ramah *"Koneksi Terputus"* dengan tombol *"Coba Lagi"*.
7. **Ikon Aplikasi Resolusi Tinggi**: Terpasang otomatis di semua resolusi HP (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`).

---

## 🚀 Cara Membuka & Membuat APK di Android Studio

1. **Buka Android Studio**:
   - Jalankan **Android Studio** di komputer Anda.
   - Pilih menu **File** > **Open...**
   - Pilih folder:
     ```
     /Users/kharismabahtiar/Projects/baru/widiya-mart-android
     ```

2. **Sync Gradle**:
   - Android Studio akan otomatis melakukan download Gradle & menyinkronkan dependencies.
   - Tunggu sampai proses indexing dan build sync selesai.

3. **Generate File APK Siap Install**:
   - Klik menu atas: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - Atau buat **Release APK** (direkomendasikan untuk di-install langsung di HP tanpa error *testOnly*):
     Klik menu **Build** > **Generate Signed Bundle / APK...** atau jalankan command Gradle `assembleRelease`.
   - File APK tersimpan di:
     - Debug: `app/build/outputs/apk/debug/app-debug.apk`
     - Release: `app/build/outputs/apk/release/app-release.apk`
   - Klik link **locate** di notifikasi Android Studio untuk membuka folder tempat file APK berada.
   - Kirim file APK tersebut ke HP (via WhatsApp, Google Drive, atau Kabel USB) dan install langsung!

---

## 🛠️ Solusi Jika Mengalami "Aplikasi Tidak Terpasang" (Install Error)

Jika saat meng-install file APK di HP muncul pesan **"Aplikasi Tidak Terpasang"** / **"App Not Installed"**:

1. **Hapus (Uninstall) Versi Lama Terlebih Dahulu**:
   - Jika di HP sudah pernah terpasang versi aplikasi Widiya Mart sebelumnya dengan tanda tangan (signature) yang berbeda, hapus dulu aplikasi lama tersebut dari HP.
2. **Gunakan APK Release (`app-release.apk`)**:
   - APK versi Debug dari Android Studio terkadang memiliki atribut `testOnly` yang diblokir oleh pemindai keamanan HP (seperti MIUI / Samsung / OPPO / Vivo).
   - Gunakan `app-release.apk` yang sudah otomatis terkonfigurasi signing-nya.
3. **Izinkan "Install Aplikasi Dari Sumber Tidak Dikenal"**:
   - Di HP Android, masuk ke **Pengaturan (Settings)** > **Keamanan (Security)** / **Privasi** > Aktifkan izin **Install dari Sumber Tidak Dikenal (Unknown Sources)** untuk aplikasi File Manager/WhatsApp/Chrome.

---

## 🎨 Konfigurasi Tambahan

- Mengubah URL Website: Buka `app/src/main/res/values/strings.xml` dan edit `web_url`.
- Mengubah Nama Aplikasi: Buka `app/src/main/res/values/strings.xml` dan edit `app_name`.
- Mengubah Warna Tema: Buka `app/src/main/res/values/colors.xml` (warna default: Coral `#FF6B35`).
