# Full-House

Aplikasi web administrasi RT. Dipakai buat kelola data penghuni, rumah, iuran bulanan (satpam & kebersihan), pengeluaran, dan laporan keuangan.

Backend pakai Laravel 12 + Sanctum (token-based auth), frontend pakai React 19 + Vite + Tailwind CSS, database MySQL.

## Struktur Folder

```
fullhouse/
├── backend/       → Laravel 12 (API)
├── frontend/      → React 19 (SPA)
├── ERD.md         → Entity Relationship Diagram
└── README.md
```

## ERD

Diagram relasi database ada di file [ERD.md](ERD.md).

## Prasyarat

Yang perlu diinstall dulu:

- PHP >= 8.2 (dengan ekstensi: mbstring, xml, curl, mysql, zip, bcmath, gd)
- Composer >= 2
- Node.js >= 18
- npm >= 9
- MySQL >= 8.0

Cek versi:

```bash
php -v
composer -V
node -v
npm -v
mysql --version
```

## Instalasi

### 1. Clone / Extract

```bash
git clone <url-repo> fullhouse
cd fullhouse
```

Atau kalau dari ZIP, extract lalu `cd` ke folder project-nya.

### 2. Buat Database

Masuk ke MySQL:

```bash
sudo mysql -u root
```

Kemudian jalankan perintah SQL berikut:

```sql
CREATE DATABASE fullhouse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'fullhouse'@'localhost' IDENTIFIED BY 'fullhouse123';
GRANT ALL PRIVILEGES ON fullhouse.* TO 'fullhouse'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Kalau mau pakai user/password lain silakan, nanti tinggal sesuaikan di `.env` backend.

### 3. Setup Backend

```bash
cd backend
```

Install dependensi PHP:

```bash
composer install
```

Copy file environment dan generate key:

```bash
cp .env.example .env
php artisan key:generate
```

Buka file `.env`, pastikan bagian database sudah sesuai:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fullhouse
DB_USERNAME=fullhouse
DB_PASSWORD=fullhouse123
```

Jalankan migrasi + seeder:

```bash
php artisan migrate --seed
```

Ini akan bikin semua tabel dan mengisi data contoh (20 rumah, 18 penghuni, data pembayaran & pengeluaran). Akun admin juga otomatis dibuat.

Buat symlink storage (supaya upload foto KTP bisa diakses):

```bash
php artisan storage:link
```

Jalankan backend:

```bash
php artisan serve --port=8000
```

Backend jalan di `http://localhost:8000`. Terminal ini jangan ditutup.

### 4. Setup Frontend

Buka terminal baru, jangan tutup yang backend tadi.

```bash
cd frontend
```

Install dependensi:

```bash
npm install
```

Jalankan dev server:

```bash
npm run dev
```

Frontend jalan di `http://localhost:5173`.

### 5. Buka Aplikasi

Buka browser ke `http://localhost:5173`, login pakai:

| | |
|---|---|
| Email | admin@fullhouse.com |
| Password | password |

## Fitur

**Dashboard** — Ringkasan jumlah rumah (dihuni/kosong), total penghuni aktif, pemasukan & pengeluaran bulan ini, saldo, dan jumlah tagihan yang belum dibayar.

**Penghuni** — CRUD data penghuni, upload foto KTP, filter status (tetap/kontrak), pencarian nama.

**Rumah** — CRUD data rumah, assign/remove penghuni (bisa lebih dari satu penghuni per rumah), lihat histori penghuni dan histori pembayaran per rumah. Status rumah otomatis berubah (dihuni/tidak dihuni).

**Pembayaran** — Catat iuran satpam & kebersihan. Bisa input satu-satu, bayar tahunan (12 bulan sekaligus), atau generate tagihan bulanan otomatis untuk semua rumah yang dihuni. Tagihan per rumah — penghuni aktif otomatis ditampilkan. Filter bulan, tahun, jenis, status.

**Pengeluaran** — CRUD pengeluaran RT (gaji satpam, listrik, perbaikan, dll). Filter bulan & tahun, total per halaman.

**Laporan** — Grafik batang pemasukan vs pengeluaran per bulan, grafik garis saldo kumulatif, tabel detail per bulan. Bisa pilih tahun. Ada akumulasi saldo semua tahun.

## Build Production

Frontend:

```bash
cd frontend
npm run build
```

Hasil build di `frontend/dist/`.

Backend:

```bash
cd backend
php artisan config:cache
php artisan route:cache
```

## Troubleshooting

**Database belum ada** — Kalau muncul error `Unknown database 'fullhouse'`, berarti langkah 2 belum dijalankan. Buat databasenya dulu.

**Access denied MySQL** — Cek lagi username/password di `.env` backend, pastikan sama dengan yang dibuat di langkah 2.

**Halaman blank setelah login** — Pastikan backend nya jalan (`php artisan serve --port=8000`). Frontend butuh backend untuk API.

**CORS error** — Biasanya karena frontend jalan di port yang beda. Pastikan backend `.env` ada `SANCTUM_STATEFUL_DOMAINS=localhost:5173`.
