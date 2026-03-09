<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    // Summary pemasukan dan pengeluaran per bulan selama 1 tahun (untuk grafik)
    public function yearSummary(Request $request)
    {
        $tahun = $request->input('tahun', date('Y'));

        $pemasukan = Payment::where('tahun', $tahun)
            ->where('status', 'lunas')
            ->select('bulan', DB::raw('SUM(jumlah) as total'))
            ->groupBy('bulan')
            ->pluck('total', 'bulan')
            ->toArray();

        $pengeluaran = Expense::where('tahun', $tahun)
            ->select('bulan', DB::raw('SUM(jumlah) as total'))
            ->groupBy('bulan')
            ->pluck('total', 'bulan')
            ->toArray();

        $data = [];
        $saldo = 0;

        for ($bulan = 1; $bulan <= 12; $bulan++) {
            $masuk = $pemasukan[$bulan] ?? 0;
            $keluar = $pengeluaran[$bulan] ?? 0;
            $saldo += ($masuk - $keluar);

            $data[] = [
                'bulan' => $bulan,
                'pemasukan' => $masuk,
                'pengeluaran' => $keluar,
                'saldo' => $saldo,
            ];
        }

        // Saldo total semua waktu (all-time)
        $allTimePemasukan = Payment::where('status', 'lunas')->sum('jumlah');
        $allTimePengeluaran = Expense::sum('jumlah');

        return response()->json([
            'tahun' => (int) $tahun,
            'data' => $data,
            'total_pemasukan' => array_sum($pemasukan),
            'total_pengeluaran' => array_sum($pengeluaran),
            'saldo_akhir' => $saldo,
            'alltime_pemasukan' => $allTimePemasukan,
            'alltime_pengeluaran' => $allTimePengeluaran,
            'alltime_saldo' => $allTimePemasukan - $allTimePengeluaran,
        ]);
    }

    // Detail pemasukan & pengeluaran untuk bulan tertentu
    public function monthDetail(Request $request)
    {
        $bulan = $request->input('bulan', date('n'));
        $tahun = $request->input('tahun', date('Y'));

        $pemasukan = Payment::with(['house', 'resident'])
            ->where('bulan', $bulan)
            ->where('tahun', $tahun)
            ->where('status', 'lunas')
            ->orderBy('tanggal_bayar')
            ->get();

        $pengeluaran = Expense::where('bulan', $bulan)
            ->where('tahun', $tahun)
            ->orderBy('tanggal')
            ->get();

        $totalPemasukan = $pemasukan->sum('jumlah');
        $totalPengeluaran = $pengeluaran->sum('jumlah');

        return response()->json([
            'bulan' => (int) $bulan,
            'tahun' => (int) $tahun,
            'pemasukan' => $pemasukan,
            'pengeluaran' => $pengeluaran,
            'total_pemasukan' => $totalPemasukan,
            'total_pengeluaran' => $totalPengeluaran,
            'saldo' => $totalPemasukan - $totalPengeluaran,
        ]);
    }

    // Status pembayaran semua rumah untuk bulan/tahun tertentu
    public function paymentStatus(Request $request)
    {
        $bulan = $request->input('bulan', date('n'));
        $tahun = $request->input('tahun', date('Y'));

        $payments = Payment::with(['house', 'resident'])
            ->where('bulan', $bulan)
            ->where('tahun', $tahun)
            ->orderBy('house_id')
            ->get()
            ->groupBy('house_id');

        return response()->json($payments);
    }
}
