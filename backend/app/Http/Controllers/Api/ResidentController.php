<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResidentController extends Controller
{
    public function index(Request $request)
    {
        $query = Resident::with('activeHouse');

        if ($request->has('search') && $request->search) {
            $query->where('nama_lengkap', 'like', '%' . $request->search . '%');
        }

        if ($request->has('status') && $request->status) {
            $query->where('status_penghuni', $request->status);
        }

        $perPage = min($request->input('per_page', 15), 100);
        $residents = $query->orderBy('nama_lengkap')->paginate($perPage);

        return response()->json($residents);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'foto_ktp' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'status_penghuni' => 'required|in:tetap,kontrak',
            'nomor_telepon' => 'required|string|max:20',
            'status_menikah' => 'required|boolean',
        ]);

        if ($request->hasFile('foto_ktp')) {
            $path = $request->file('foto_ktp')->store('ktp', 'public');
            $validated['foto_ktp'] = $path;
        }

        $resident = Resident::create($validated);

        return response()->json($resident, 201);
    }

    public function show(string $id)
    {
        $resident = Resident::with(['houseResidents.house', 'payments'])->findOrFail($id);

        return response()->json($resident);
    }

    public function update(Request $request, string $id)
    {
        $resident = Resident::findOrFail($id);

        $validated = $request->validate([
            'nama_lengkap' => 'sometimes|required|string|max:255',
            'foto_ktp' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'status_penghuni' => 'sometimes|required|in:tetap,kontrak',
            'nomor_telepon' => 'sometimes|required|string|max:20',
            'status_menikah' => 'sometimes|required|boolean',
        ]);

        if ($request->hasFile('foto_ktp')) {
            // hapus foto lama
            if ($resident->foto_ktp) {
                Storage::disk('public')->delete($resident->foto_ktp);
            }
            $path = $request->file('foto_ktp')->store('ktp', 'public');
            $validated['foto_ktp'] = $path;
        }

        $resident->update($validated);

        return response()->json($resident);
    }

    public function destroy(string $id)
    {
        $resident = Resident::findOrFail($id);

        if ($resident->foto_ktp) {
            Storage::disk('public')->delete($resident->foto_ktp);
        }

        $resident->delete();

        return response()->json(['message' => 'Penghuni berhasil dihapus']);
    }
}
