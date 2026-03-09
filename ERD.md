# ERD - Full-House

```mermaid
erDiagram
    users {
        bigint id PK
        string name
        string email UK
        string password
        timestamp created_at
        timestamp updated_at
    }

    personal_access_tokens {
        bigint id PK
        string tokenable_type
        bigint tokenable_id FK
        string name
        string token UK
        text abilities
        timestamp last_used_at
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    residents {
        bigint id PK
        string nama_lengkap
        string foto_ktp "nullable"
        enum status_penghuni "tetap | kontrak"
        string nomor_telepon
        boolean status_menikah
        timestamp created_at
        timestamp updated_at
    }

    houses {
        bigint id PK
        string nomor_rumah UK
        text alamat "nullable"
        enum status_rumah "dihuni | tidak_dihuni"
        timestamp created_at
        timestamp updated_at
    }

    house_residents {
        bigint id PK
        bigint house_id FK
        bigint resident_id FK
        date tanggal_masuk
        date tanggal_keluar "nullable"
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    payments {
        bigint id PK
        bigint house_id FK
        bigint resident_id FK "nullable"
        enum jenis_iuran "satpam | kebersihan"
        integer bulan
        integer tahun
        integer jumlah
        enum status "lunas | belum"
        date tanggal_bayar "nullable"
        timestamp created_at
        timestamp updated_at
    }

    expenses {
        bigint id PK
        string deskripsi
        integer jumlah
        integer bulan
        integer tahun
        date tanggal
        string kategori "nullable"
        timestamp created_at
        timestamp updated_at
    }

    users ||--o{ personal_access_tokens : "auth tokens"
    houses ||--o{ house_residents : "dihuni oleh"
    residents ||--o{ house_residents : "menghuni"
    houses ||--o{ payments : "tagihan rumah"
    residents |o--o{ payments : "pembayar (opsional)"
```

## Relasi

**houses <-> residents** — Many-to-Many lewat tabel `house_residents`. Satu rumah bisa punya beberapa penghuni sekaligus, dan satu penghuni bisa pindah rumah. Tabel pivot-nya nyimpen histori: kapan masuk, kapan keluar, dan apakah masih aktif.

**houses -> payments** — One-to-Many. Tagihan iuran nempel ke rumah, bukan ke orang. Jadi kalau penghuni pindah, tagihan tetap tercatat per rumah.

**residents -> payments** — Optional. Kolom `resident_id` nullable karena tagihan yang di-generate otomatis belum tentu ada penghuni spesifik yang bayar. Kalau dicatat manual baru bisa diisi siapa yang bayar.

**expenses** — Berdiri sendiri, tidak relasi ke tabel lain. Ini untuk catat pengeluaran RT seperti gaji satpam, listrik, perbaikan, dll.

**users -> personal_access_tokens** — Sanctum punya, untuk autentikasi API pakai Bearer token. Satu user bisa login dari beberapa device.

## Catatan Kolom

| Tabel | Kolom | Catatan |
|-------|-------|---------|
| residents | status_penghuni | `tetap` = pemilik, `kontrak` = penyewa/ngontrak |
| residents | foto_ktp | Path file KTP yang diupload, nullable |
| houses | status_rumah | Otomatis berubah waktu assign/remove penghuni |
| house_residents | is_active | Penanda penghuni aktif, bisa lebih dari satu per rumah |
| payments | jenis_iuran | `satpam` atau `kebersihan` |
| payments | resident_id | Nullable — tagihan per rumah, bukan per orang |
| expenses | kategori | Free text (Gaji Satpam, Perbaikan Jalan, dll) |
