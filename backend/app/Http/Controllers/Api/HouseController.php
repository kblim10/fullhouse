<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\House;
use App\Models\HouseResident;
use Illuminate\Http\Request;

class HouseController extends Controller
{
    public function index(Request $request)
    {
        $query = House::with('activeResident');

        if ($request->has('status') && $request->status) {
            $query->where('status_rumah', $request->status);
        }

        $perPage = min($request->input('per_page', 20), 100);
        $houses = $query->orderBy('nomor_rumah')->paginate($perPage);

        return response()->json($houses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomor_rumah' => 'required|string|max:50|unique:houses,nomor_rumah',
            'alamat' => 'nullable|string',
            'status_rumah' => 'required|in:dihuni,tidak_dihuni',
        ]);

        $house = House::create($validated);

        return response()->json($house, 201);
    }

    public function show(string $id)
    {
        $house = House::with([
            'houseResidents.resident',
            'payments.resident',
        ])->findOrFail($id);

        return response()->json($house);
    }

    public function update(Request $request, string $id)
    {
        $house = House::findOrFail($id);

        $validated = $request->validate([
            'nomor_rumah' => 'sometimes|required|string|max:50|unique:houses,nomor_rumah,' . $id,
            'alamat' => 'nullable|string',
            'status_rumah' => 'sometimes|required|in:dihuni,tidak_dihuni',
        ]);

        $house->update($validated);

        return response()->json($house);
    }

    public function destroy(string $id)
    {
        $house = House::findOrFail($id);
        $house->delete();

        return response()->json(['message' => 'Rumah berhasil dihapus']);
    }

    // Assign penghuni ke rumah
    public function assignResident(Request $request, string $id)
    {
        $house = House::findOrFail($id);

        $validated = $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'tanggal_masuk' => 'required|date',
        ]);

        // Cek apakah penghuni sudah aktif di rumah ini
        $exists = HouseResident::where('house_id', $id)
            ->where('resident_id', $validated['resident_id'])
            ->where('is_active', true)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Penghuni sudah terdaftar aktif di rumah ini'], 422);
        }

        // Tambah penghuni baru (tanpa menonaktifkan yang lain)
        $houseResident = HouseResident::create([
            'house_id' => $id,
            'resident_id' => $validated['resident_id'],
            'tanggal_masuk' => $validated['tanggal_masuk'],
            'is_active' => true,
        ]);

        $house->update(['status_rumah' => 'dihuni']);

        return response()->json($houseResident->load('resident'), 201);
    }

    // Keluarkan penghuni dari rumah
    public function removeResident(Request $request, string $id)
    {
        $house = House::findOrFail($id);

        $residentId = $request->input('resident_id');

        if ($residentId) {
            // Keluarkan penghuni tertentu
            HouseResident::where('house_id', $id)
                ->where('resident_id', $residentId)
                ->where('is_active', true)
                ->update([
                    'is_active' => false,
                    'tanggal_keluar' => now()->format('Y-m-d'),
                ]);
        } else {
            // Keluarkan semua penghuni
            HouseResident::where('house_id', $id)
                ->where('is_active', true)
                ->update([
                    'is_active' => false,
                    'tanggal_keluar' => now()->format('Y-m-d'),
                ]);
        }

        // Cek apakah masih ada penghuni aktif
        $stillActive = HouseResident::where('house_id', $id)->where('is_active', true)->exists();
        if (!$stillActive) {
            $house->update(['status_rumah' => 'tidak_dihuni']);
        }

        return response()->json(['message' => 'Penghuni berhasil dikeluarkan']);
    }

    // History penghuni rumah
    public function residentHistory(string $id)
    {
        $history = HouseResident::with('resident')
            ->where('house_id', $id)
            ->orderBy('tanggal_masuk', 'desc')
            ->get();

        return response()->json($history);
    }

    // History pembayaran rumah
    public function paymentHistory(string $id)
    {
        $house = House::findOrFail($id);

        $payments = $house->payments()
            ->with('resident')
            ->orderBy('tahun', 'desc')
            ->orderBy('bulan', 'desc')
            ->get();

        return response()->json($payments);
    }
}
