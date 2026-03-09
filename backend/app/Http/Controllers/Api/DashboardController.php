<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\House;
use App\Models\Resident;
use App\Models\Payment;
use App\Models\Expense;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $totalRumah = House::count();
        $rumahDihuni = House::where('status_rumah', 'dihuni')->count();
        $rumahKosong = House::where('status_rumah', 'tidak_dihuni')->count();
        $totalPenghuni = Resident::count();

        $bulanIni = date('n');
        $tahunIni = date('Y');

        $pemasukanBulanIni = Payment::where('bulan', $bulanIni)
            ->where('tahun', $tahunIni)
            ->where('status', 'lunas')
            ->sum('jumlah');

        $pengeluaranBulanIni = Expense::where('bulan', $bulanIni)
            ->where('tahun', $tahunIni)
            ->sum('jumlah');

        $belumBayar = Payment::where('bulan', $bulanIni)
            ->where('tahun', $tahunIni)
            ->where('status', 'belum')
            ->count();

        $sudahBayar = Payment::where('bulan', $bulanIni)
            ->where('tahun', $tahunIni)
            ->where('status', 'lunas')
            ->count();

        return response()->json([
            'total_rumah' => $totalRumah,
            'rumah_dihuni' => $rumahDihuni,
            'rumah_kosong' => $rumahKosong,
            'total_penghuni' => $totalPenghuni,
            'pemasukan_bulan_ini' => $pemasukanBulanIni,
            'pengeluaran_bulan_ini' => $pengeluaranBulanIni,
            'tagihan_belum_bayar' => $belumBayar,
            'tagihan_sudah_bayar' => $sudahBayar,
            'bulan' => $bulanIni,
            'tahun' => $tahunIni,
        ]);
    }
}
