# Rangkuman Fitur - Full-House

Dokumentasi screenshot per fitur aplikasi Full-House (Administrasi RT).

Tech stack: Laravel 12 (backend API) + React 19 (frontend SPA) + MySQL 8.

---

## 1. Login

Halaman login admin RT. User memasukkan email dan password, sistem mengembalikan Bearer Token dari Laravel Sanctum yang dipakai untuk semua request API selanjutnya. Tidak menggunakan session/cookie — murni token-based.

![Login](screenshots/login.png)

---

## 2. Dashboard

Halaman utama setelah login. Menampilkan:
- Jumlah rumah total, yang dihuni, dan yang kosong
- Total penghuni aktif
- Total pemasukan (iuran) bulan berjalan
- Total pengeluaran bulan berjalan
- Saldo bulan berjalan
- Jumlah tagihan yang belum dibayar bulan ini

Data di-fetch dari endpoint `/api/dashboard` yang menghitung langsung dari database.

![Dashboard](screenshots/dashboard.png)

---

## 3. Data Penghuni

Halaman kelola data penghuni RT. Fitur yang tersedia:
- **Tabel penghuni** dengan kolom nama, status (tetap/kontrak), nomor telepon, status menikah, rumah aktif, dan foto KTP
- **Tambah penghuni** — input nama, telepon, status penghuni, status menikah, dan upload file KTP
- **Edit penghuni** — form terisi otomatis dengan data yang ada, bisa ganti KTP (preview KTP lama ditampilkan)
- **Lihat KTP** — klik tombol "Lihat" untuk membuka foto KTP dalam lightbox
- **Filter** berdasarkan status penghuni (tetap/kontrak)
- **Search** berdasarkan nama
- Kolom "Rumah" menampilkan semua rumah aktif yang ditempati penghuni tersebut

![List Penghuni](screenshots/penghuni-list.png)

![Tambah Penghuni](screenshots/penghuni-tambah.png)

![Edit Penghuni](screenshots/penghuni-edit.png)

![Lihat KTP](screenshots/penghuni-ktp.png)

---

## 4. Data Rumah

Halaman kelola data rumah perumahan. Ditampilkan dalam format card grid, tiap card menunjukkan nomor rumah, alamat, status, dan daftar penghuni aktif. Fitur:
- **Tambah/edit/hapus rumah**
- **Assign penghuni** — ketik nama penghuni via autocomplete (SearchInput), pilih, lalu assign. Satu rumah bisa punya lebih dari satu penghuni
- **Remove penghuni** — klik tombol X di nama penghuni pada card rumah untuk mengeluarkan penghuni tertentu
- **Histori penghuni** — lihat siapa saja yang pernah tinggal di rumah tersebut, termasuk tanggal masuk dan keluar
- **Histori pembayaran** — lihat semua record pembayaran iuran untuk rumah tersebut
- Status rumah otomatis berubah: kalau ada penghuni aktif = "dihuni", kalau kosong = "tidak dihuni"

![List Rumah](screenshots/rumah-list.png)

![Assign Penghuni](screenshots/rumah-assign.png)

![Histori Penghuni](screenshots/rumah-histori-penghuni.png)

![Histori Pembayaran](screenshots/rumah-histori-pembayaran.png)

---

## 5. Pembayaran Iuran

Halaman kelola pembayaran iuran bulanan (satpam & kebersihan). Konsep utama: **tagihan per rumah**, bukan per individu penghuni. Ketika pilih rumah, penghuni aktif otomatis ditampilkan.

Fitur:
- **Tabel pembayaran** — kolom rumah, penghuni (otomatis dari data rumah), jenis iuran, periode, jumlah, dan status (lunas/belum)
- **Tambah pembayaran** — pilih rumah (penghuni auto-muncul), jenis iuran, bulan, tahun, jumlah, status, tanggal bayar
- **Edit pembayaran** — form terisi otomatis sesuai data yang ada, tinggal ubah field yang perlu (misalnya ubah status dari "belum" ke "lunas")
- **Generate tagihan** — generate tagihan otomatis untuk semua rumah yang dihuni pada bulan tertentu. Pilih jenis iuran dan jumlah, sistem bikin record untuk setiap rumah yang ada penghuninya
- **Bayar tahunan** — bayar 12 bulan sekaligus untuk satu rumah, satu jenis iuran
- **Filter** berdasarkan bulan, tahun, jenis iuran, dan status pembayaran

![List Pembayaran](screenshots/pembayaran-list.png)

![Tambah Pembayaran](screenshots/pembayaran-tambah.png)

![Edit Pembayaran](screenshots/pembayaran-edit.png)

![Generate Tagihan](screenshots/pembayaran-generate.png)

![Bayar Tahunan](screenshots/pembayaran-tahunan.png)

---

## 6. Pengeluaran

Halaman kelola pengeluaran RT. Fitur:
- **Tabel pengeluaran** — kolom deskripsi, kategori, jumlah, tanggal. Di bagian bawah ada total pengeluaran
- **Tambah/edit/hapus pengeluaran** — input deskripsi, jumlah, tanggal, dan kategori (Gaji Satpam, Listrik Pos, Perbaikan Jalan, Kebersihan, dll)
- **Filter** berdasarkan bulan dan tahun
- Total pengeluaran dihitung dari `SUM(jumlah)`, bukan count record

![List Pengeluaran](screenshots/pengeluaran-list.png)

![Tambah Pengeluaran](screenshots/pengeluaran-tambah.png)

---

## 7. Laporan Keuangan

Halaman laporan keuangan RT per tahun. Fitur:
- **Grafik batang** — perbandingan pemasukan (total iuran lunas) vs pengeluaran per bulan
- **Grafik garis** — saldo kumulatif per bulan (pemasukan dikurangi pengeluaran, narastif dari bulan ke bulan)
- **Akumulasi semua tahun** — total saldo dari tahun pertama sampai sekarang, ditampilkan di atas grafik
- **Tabel detail** — klik bulan tertentu untuk lihat rincian pemasukan dan pengeluaran bulan tersebut
- **Pilih tahun** — dropdown untuk ganti tahun laporan

![Laporan Grafik](screenshots/laporan-grafik.png)

![Laporan Detail](screenshots/laporan-detail.png)
