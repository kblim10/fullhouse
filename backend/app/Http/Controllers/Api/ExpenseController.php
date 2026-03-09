<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::query();

        if ($request->has('bulan') && $request->bulan) {
            $query->where('bulan', $request->bulan);
        }

        if ($request->has('tahun') && $request->tahun) {
            $query->where('tahun', $request->tahun);
        }

        if ($request->has('kategori') && $request->kategori) {
            $query->where('kategori', $request->kategori);
        }

        $expenses = $query->orderBy('tanggal', 'desc')->paginate(20);

        // Hitung total jumlah pengeluaran (dari query yang sama, tanpa paginate)
        $totalJumlah = (clone $query)->sum('jumlah');

        $response = $expenses->toArray();
        $response['total_jumlah'] = $totalJumlah;

        return response()->json($response);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'deskripsi' => 'required|string|max:255',
            'jumlah' => 'required|integer|min:0',
            'bulan' => 'required|integer|min:1|max:12',
            'tahun' => 'required|integer|min:2020',
            'tanggal' => 'required|date',
            'kategori' => 'nullable|string|max:100',
        ]);

        $expense = Expense::create($validated);

        return response()->json($expense, 201);
    }

    public function show(string $id)
    {
        $expense = Expense::findOrFail($id);

        return response()->json($expense);
    }

    public function update(Request $request, string $id)
    {
        $expense = Expense::findOrFail($id);

        $validated = $request->validate([
            'deskripsi' => 'sometimes|required|string|max:255',
            'jumlah' => 'sometimes|required|integer|min:0',
            'bulan' => 'sometimes|required|integer|min:1|max:12',
            'tahun' => 'sometimes|required|integer|min:2020',
            'tanggal' => 'sometimes|required|date',
            'kategori' => 'nullable|string|max:100',
        ]);

        $expense->update($validated);

        return response()->json($expense);
    }

    public function destroy(string $id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();

        return response()->json(['message' => 'Pengeluaran berhasil dihapus']);
    }
}
