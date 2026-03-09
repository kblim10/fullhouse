<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Resident;
use App\Models\House;
use App\Models\HouseResident;
use App\Models\Payment;
use App\Models\Expense;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // User admin (RT)
        User::create([
            'name' => 'Pak RT Sugianto',
            'email' => 'admin@fullhouse.com',
            'password' => Hash::make('password'),
        ]);

        // 20 Rumah
        $rumahData = [];
        for ($i = 1; $i <= 20; $i++) {
            $rumahData[] = House::create([
                'nomor_rumah' => 'A-' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'alamat' => 'Blok A No. ' . $i . ', Perumahan Griya Asri',
                'status_rumah' => 'tidak_dihuni',
            ]);
        }

        // 15 Penghuni tetap
        $penghuniTetap = [
            ['nama_lengkap' => 'Budi Santoso', 'nomor_telepon' => '081234567001', 'status_menikah' => true],
            ['nama_lengkap' => 'Siti Rahayu', 'nomor_telepon' => '081234567002', 'status_menikah' => true],
            ['nama_lengkap' => 'Ahmad Wijaya', 'nomor_telepon' => '081234567003', 'status_menikah' => true],
            ['nama_lengkap' => 'Dewi Lestari', 'nomor_telepon' => '081234567004', 'status_menikah' => false],
            ['nama_lengkap' => 'Eko Prasetyo', 'nomor_telepon' => '081234567005', 'status_menikah' => true],
            ['nama_lengkap' => 'Fitriani Putri', 'nomor_telepon' => '081234567006', 'status_menikah' => true],
            ['nama_lengkap' => 'Gunawan Hidayat', 'nomor_telepon' => '081234567007', 'status_menikah' => true],
            ['nama_lengkap' => 'Hesti Wulandari', 'nomor_telepon' => '081234567008', 'status_menikah' => false],
            ['nama_lengkap' => 'Irfan Hakim', 'nomor_telepon' => '081234567009', 'status_menikah' => true],
            ['nama_lengkap' => 'Joko Susilo', 'nomor_telepon' => '081234567010', 'status_menikah' => true],
            ['nama_lengkap' => 'Kartini Sari', 'nomor_telepon' => '081234567011', 'status_menikah' => true],
            ['nama_lengkap' => 'Lukman Hakim', 'nomor_telepon' => '081234567012', 'status_menikah' => false],
            ['nama_lengkap' => 'Mega Puspita', 'nomor_telepon' => '081234567013', 'status_menikah' => true],
            ['nama_lengkap' => 'Nugroho Adi', 'nomor_telepon' => '081234567014', 'status_menikah' => true],
            ['nama_lengkap' => 'Oktavia Sari', 'nomor_telepon' => '081234567015', 'status_menikah' => true],
        ];

        $penghuniTetapModels = [];
        foreach ($penghuniTetap as $data) {
            $penghuniTetapModels[] = Resident::create(array_merge($data, [
                'status_penghuni' => 'tetap',
            ]));
        }

        // 3 penghuni kontrak (untuk 3 dari 5 rumah kosong)
        $penghuniKontrak = [
            ['nama_lengkap' => 'Rini Agustina', 'nomor_telepon' => '081234567016', 'status_menikah' => false],
            ['nama_lengkap' => 'Surya Dharma', 'nomor_telepon' => '081234567017', 'status_menikah' => true],
            ['nama_lengkap' => 'Tania Permata', 'nomor_telepon' => '081234567018', 'status_menikah' => false],
        ];

        $penghuniKontrakModels = [];
        foreach ($penghuniKontrak as $data) {
            $penghuniKontrakModels[] = Resident::create(array_merge($data, [
                'status_penghuni' => 'kontrak',
            ]));
        }

        // Assign 15 penghuni tetap ke rumah 1-15
        for ($i = 0; $i < 15; $i++) {
            HouseResident::create([
                'house_id' => $rumahData[$i]->id,
                'resident_id' => $penghuniTetapModels[$i]->id,
                'tanggal_masuk' => '2024-01-01',
                'is_active' => true,
            ]);
            $rumahData[$i]->update(['status_rumah' => 'dihuni']);
        }

        // Assign 3 penghuni kontrak ke rumah 16, 17, 18
        for ($i = 0; $i < 3; $i++) {
            HouseResident::create([
                'house_id' => $rumahData[15 + $i]->id,
                'resident_id' => $penghuniKontrakModels[$i]->id,
                'tanggal_masuk' => '2025-06-01',
                'is_active' => true,
            ]);
            $rumahData[15 + $i]->update(['status_rumah' => 'dihuni']);
        }

        // Rumah 19 dan 20 tetap kosong

        // Tambahkan riwayat penghuni lama untuk rumah 16 (pernah ditinggali sebelumnya)
        HouseResident::create([
            'house_id' => $rumahData[15]->id,
            'resident_id' => $penghuniTetapModels[0]->id, // Budi pernah tinggal di sini
            'tanggal_masuk' => '2023-01-01',
            'tanggal_keluar' => '2025-05-30',
            'is_active' => false,
        ]);

        // Generate pembayaran untuk beberapa bulan
        $allActiveHR = HouseResident::where('is_active', true)->get();

        // Pembayaran Jan - Des 2025 dan Jan - Feb 2026
        $bulanPembayaran = [
            ['tahun' => 2025, 'bulan_mulai' => 1, 'bulan_akhir' => 12],
            ['tahun' => 2026, 'bulan_mulai' => 1, 'bulan_akhir' => 2],
        ];

        foreach ($bulanPembayaran as $periode) {
            for ($bulan = $periode['bulan_mulai']; $bulan <= $periode['bulan_akhir']; $bulan++) {
                foreach ($allActiveHR as $hr) {
                    // Cek apakah penghuni kontrak sudah masuk di bulan ini
                    $masuk = strtotime($hr->tanggal_masuk);
                    $periodeDate = strtotime($periode['tahun'] . '-' . str_pad($bulan, 2, '0', STR_PAD_LEFT) . '-01');
                    if ($periodeDate < $masuk) continue;

                    foreach (['satpam', 'kebersihan'] as $jenis) {
                        $jumlah = $jenis === 'satpam' ? 100000 : 15000;

                        // Sebagian sudah lunas, sebagian belum
                        $isCurrentMonth = ($periode['tahun'] == 2026 && $bulan >= 2);
                        $randomPaid = rand(1, 10) > ($isCurrentMonth ? 4 : 1);

                        Payment::create([
                            'house_id' => $hr->house_id,
                            'resident_id' => $hr->resident_id,
                            'jenis_iuran' => $jenis,
                            'bulan' => $bulan,
                            'tahun' => $periode['tahun'],
                            'jumlah' => $jumlah,
                            'status' => $randomPaid ? 'lunas' : 'belum',
                            'tanggal_bayar' => $randomPaid ? $periode['tahun'] . '-' . str_pad($bulan, 2, '0', STR_PAD_LEFT) . '-' . str_pad(rand(1, 28), 2, '0', STR_PAD_LEFT) : null,
                        ]);
                    }
                }
            }
        }

        // Pengeluaran rutin dan tidak rutin
        $pengeluaranRutin = [
            ['deskripsi' => 'Gaji Satpam', 'jumlah' => 1500000, 'kategori' => 'Gaji Satpam'],
            ['deskripsi' => 'Token Listrik Pos Satpam', 'jumlah' => 200000, 'kategori' => 'Listrik Pos'],
        ];

        // Generate untuk 2025 dan awal 2026
        foreach ($bulanPembayaran as $periode) {
            for ($bulan = $periode['bulan_mulai']; $bulan <= $periode['bulan_akhir']; $bulan++) {
                foreach ($pengeluaranRutin as $item) {
                    Expense::create([
                        'deskripsi' => $item['deskripsi'] . ' - ' . $this->getNamaBulan($bulan),
                        'jumlah' => $item['jumlah'],
                        'bulan' => $bulan,
                        'tahun' => $periode['tahun'],
                        'tanggal' => $periode['tahun'] . '-' . str_pad($bulan, 2, '0', STR_PAD_LEFT) . '-25',
                        'kategori' => $item['kategori'],
                    ]);
                }
            }
        }

        // Pengeluaran tidak rutin
        $pengeluaranTidakRutin = [
            ['deskripsi' => 'Perbaikan jalan depan blok A', 'jumlah' => 2500000, 'bulan' => 3, 'tahun' => 2025, 'kategori' => 'Perbaikan Jalan'],
            ['deskripsi' => 'Perbaikan selokan samping', 'jumlah' => 800000, 'bulan' => 5, 'tahun' => 2025, 'kategori' => 'Perbaikan Selokan'],
            ['deskripsi' => 'Cat ulang pos satpam', 'jumlah' => 500000, 'bulan' => 7, 'tahun' => 2025, 'kategori' => 'Lainnya'],
            ['deskripsi' => 'Pasang lampu jalan baru', 'jumlah' => 1200000, 'bulan' => 9, 'tahun' => 2025, 'kategori' => 'Lainnya'],
            ['deskripsi' => 'Perbaikan gorong-gorong', 'jumlah' => 600000, 'bulan' => 11, 'tahun' => 2025, 'kategori' => 'Perbaikan Selokan'],
            ['deskripsi' => 'Pembelian gerobak sampah baru', 'jumlah' => 350000, 'bulan' => 1, 'tahun' => 2026, 'kategori' => 'Kebersihan'],
        ];

        foreach ($pengeluaranTidakRutin as $item) {
            Expense::create([
                'deskripsi' => $item['deskripsi'],
                'jumlah' => $item['jumlah'],
                'bulan' => $item['bulan'],
                'tahun' => $item['tahun'],
                'tanggal' => $item['tahun'] . '-' . str_pad($item['bulan'], 2, '0', STR_PAD_LEFT) . '-' . str_pad(rand(1, 28), 2, '0', STR_PAD_LEFT),
                'kategori' => $item['kategori'],
            ]);
        }
    }

    private function getNamaBulan($bulan)
    {
        $nama = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return $nama[$bulan] ?? '';
    }
}
