<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\HouseResident;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with(['house.activeResident', 'resident']);

        if ($request->has('bulan') && $request->bulan) {
            $query->where('bulan', $request->bulan);
        }

        if ($request->has('tahun') && $request->tahun) {
            $query->where('tahun', $request->tahun);
        }

        if ($request->has('jenis_iuran') && $request->jenis_iuran) {
            $query->where('jenis_iuran', $request->jenis_iuran);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $payments = $query->orderBy('tahun', 'desc')
            ->orderBy('bulan', 'desc')
            ->paginate(20);

        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'house_id' => 'required|exists:houses,id',
            'resident_id' => 'nullable|exists:residents,id',
            'jenis_iuran' => 'required|in:satpam,kebersihan',
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer|min:2020',
            'jumlah' => 'required|integer|min:0',
            'status' => 'required|in:lunas,belum',
            'tanggal_bayar' => 'nullable|date',
        ]);

        if ($validated['status'] === 'lunas' && !$validated['tanggal_bayar']) {
            $validated['tanggal_bayar'] = now()->format('Y-m-d');
        }

        $payment = Payment::create($validated);

        return response()->json($payment->load(['house.activeResident', 'resident']), 201);
    }

    // Bayar iuran tahunan (buat 12 bulan sekaligus)
    public function storeBulk(Request $request)
    {
        $validated = $request->validate([
            'house_id' => 'required|exists:houses,id',
            'resident_id' => 'nullable|exists:residents,id',
            'jenis_iuran' => 'required|in:satpam,kebersihan',
            'tahun' => 'required|integer|min:2020',
            'jumlah' => 'required|integer|min:0',
        ]);

        $created = [];
        for ($bulan = 1; $bulan <= 12; $bulan++) {
            $exists = Payment::where('house_id', $validated['house_id'])
                ->where('jenis_iuran', $validated['jenis_iuran'])
                ->where('bulan', $bulan)
                ->where('tahun', $validated['tahun'])
                ->first();

            if (!$exists) {
                $created[] = Payment::create([
                    'house_id' => $validated['house_id'],
                    'resident_id' => $validated['resident_id'] ?? null,
                    'jenis_iuran' => $validated['jenis_iuran'],
                    'bulan' => $bulan,
                    'tahun' => $validated['tahun'],
                    'jumlah' => $validated['jumlah'],
                    'status' => 'lunas',
                    'tanggal_bayar' => now()->format('Y-m-d'),
                ]);
            }
        }

        return response()->json([
            'message' => count($created) . ' pembayaran berhasil dibuat',
            'data' => $created,
        ], 201);
    }

    public function show(string $id)
    {
        $payment = Payment::with(['house', 'resident'])->findOrFail($id);

        return response()->json($payment);
    }

    public function update(Request $request, string $id)
    {
        $payment = Payment::findOrFail($id);

        $validated = $request->validate([
            'house_id' => 'sometimes|required|exists:houses,id',
            'resident_id' => 'nullable|exists:residents,id',
            'jenis_iuran' => 'sometimes|required|in:satpam,kebersihan',
            'bulan' => 'sometimes|required|integer|min:1|max:12',
            'tahun' => 'sometimes|required|integer|min:2020',
            'jumlah' => 'sometimes|required|integer|min:0',
            'status' => 'sometimes|required|in:lunas,belum',
            'tanggal_bayar' => 'nullable|date',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'lunas' && !isset($validated['tanggal_bayar'])) {
            $validated['tanggal_bayar'] = now()->format('Y-m-d');
        }

        $payment->update($validated);

        return response()->json($payment->load(['house.activeResident', 'resident']));
    }

    public function destroy(string $id)
    {
        $payment = Payment::findOrFail($id);
        $payment->delete();

        return response()->json(['message' => 'Pembayaran berhasil dihapus']);
    }

    // Generate tagihan bulanan untuk semua rumah yang dihuni
    public function generateMonthly(Request $request)
    {
        $validated = $request->validate([
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer|min:2020',
            'jenis_iuran' => 'required|in:satpam,kebersihan',
            'jumlah' => 'required|integer|min:0',
        ]);

        // Ambil semua house_id yang punya penghuni aktif (unique per house)
        $occupiedHouseIds = HouseResident::where('is_active', true)
            ->distinct()
            ->pluck('house_id');

        $created = 0;

        foreach ($occupiedHouseIds as $houseId) {
            $exists = Payment::where('house_id', $houseId)
                ->where('jenis_iuran', $validated['jenis_iuran'])
                ->where('bulan', $validated['bulan'])
                ->where('tahun', $validated['tahun'])
                ->exists();

            if (!$exists) {
                Payment::create([
                    'house_id' => $houseId,
                    'resident_id' => null,
                    'jenis_iuran' => $validated['jenis_iuran'],
                    'bulan' => $validated['bulan'],
                    'tahun' => $validated['tahun'],
                    'jumlah' => $validated['jumlah'],
                    'status' => 'belum',
                ]);
                $created++;
            }
        }

        return response()->json([
            'message' => $created . ' tagihan berhasil di-generate',
        ]);
    }
}
