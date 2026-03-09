import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiX, HiOutlineCalculator } from 'react-icons/hi';
import Dropdown from '../components/Dropdown';

const CATEGORIES = ['Gaji Satpam', 'Listrik', 'Kebersihan', 'Perbaikan', 'Lainnya'];

export default function ExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [filterBulan, setFilterBulan] = useState('');
  const [filterTahun, setFilterTahun] = useState(currentYear);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  const [form, setForm] = useState({
    kategori: 'Gaji Satpam', deskripsi: '', jumlah: '', bulan: currentMonth, tahun: currentYear, tanggal: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { fetchExpenses(); }, [page, filterBulan, filterTahun]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (filterBulan) params.bulan = filterBulan;
      if (filterTahun) params.tahun = filterTahun;
      const res = await api.get('/expenses', { params });
      setExpenses(res.data.data || []);
      setMeta(res.data.meta || res.data);
      setTotalPengeluaran(res.data.total_jumlah || 0);
    } catch { toast.error('Gagal memuat data pengeluaran'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm({ kategori: 'Gaji Satpam', deskripsi: '', jumlah: '', bulan: currentMonth, tahun: currentYear, tanggal: new Date().toISOString().split('T')[0] });
    setEditingId(null); setShowModal(true);
  };

  const openEdit = (e) => {
    setForm({ kategori: e.kategori, deskripsi: e.deskripsi || '', jumlah: e.jumlah, bulan: e.bulan, tahun: e.tahun, tanggal: e.tanggal || '' });
    setEditingId(e.id); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/expenses/${editingId}`, form); toast.success('Pengeluaran berhasil diubah'); }
      else { await api.post('/expenses', form); toast.success('Pengeluaran berhasil ditambahkan'); }
      setShowModal(false); fetchExpenses();
    } catch (err) { toast.error(err.response?.data?.message || 'Terjadi kesalahan'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus pengeluaran ini?')) return;
    try { await api.delete(`/expenses/${id}`); toast.success('Pengeluaran berhasil dihapus'); fetchExpenses(); }
    catch { toast.error('Gagal menghapus pengeluaran'); }
  };

  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
  const namaBulanFull = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const namaBulan = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

  const categoryColor = (c) => {
    switch (c) {
      case 'Gaji Satpam': return 'bg-blue-50 text-blue-700';
      case 'Listrik': return 'bg-amber-50 text-amber-700';
      case 'Kebersihan': return 'bg-emerald-50 text-emerald-700';
      case 'Perbaikan': return 'bg-purple-50 text-purple-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <p className="text-sm text-slate-500">Catat dan kelola pengeluaran RT</p>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer">
          <HiPlus className="w-4 h-4" /> Tambah Pengeluaran
        </button>
      </div>

      {/* Summary & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <HiOutlineCalculator className="w-5 h-5" />
            </div>
            <p className="text-sm text-red-100">Total Pengeluaran</p>
          </div>
          <p className="text-xl font-bold">{formatRupiah(totalPengeluaran)}</p>
          <p className="text-xs text-red-200 mt-1">{filterBulan ? namaBulanFull[filterBulan] : 'Semua bulan'} {filterTahun}</p>
        </div>
        <div className="md:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center">
          <div className="flex flex-wrap gap-3">
            <Dropdown
              className="w-44"
              value={filterBulan}
              onChange={v => { setFilterBulan(v); setPage(1); }}
              placeholder="Semua Bulan"
              options={[{value: '', label: 'Semua Bulan'}, ...namaBulanFull.slice(1).map((b, i) => ({value: String(i+1), label: b}))]}
            />
            <input type="number" value={filterTahun} onChange={e => { setFilterTahun(e.target.value); setPage(1); }}
              className="w-24 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Tahun" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <HiOutlineCalculator className="w-12 h-12 mb-3 text-slate-300" />
            <p className="font-medium text-slate-500">Tidak ada data pengeluaran</p>
            <p className="text-sm mt-1">Klik tombol Tambah untuk mencatat pengeluaran baru</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kategori</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Deskripsi</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Periode</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Jumlah</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500">{e.tanggal ? new Date(e.tanggal).toLocaleDateString('id-ID', {day:'2-digit',month:'2-digit',year:'numeric'}) : '-'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${categoryColor(e.kategori)}`}>{e.kategori}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-[200px] truncate">{e.deskripsi || '-'}</td>
                    <td className="px-5 py-3.5 text-slate-500">{namaBulan[e.bulan]} {e.tahun}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-700">{formatRupiah(e.jumlah)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(e)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"><HiPencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(e.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"><HiTrash className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
            <p className="text-xs text-slate-400">Hal {meta.current_page} dari {meta.last_page}</p>
            <div className="flex gap-1">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium cursor-pointer ${page === p ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">{editingId ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><HiX className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Kategori</label>
                  <Dropdown value={form.kategori} onChange={v => setForm({...form, kategori: v})} options={CATEGORIES.map(c => ({value: c, label: c}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal</label>
                  <input type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Deskripsi</label>
                <input type="text" value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} placeholder="Keterangan pengeluaran" className={inputClass} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Jumlah (Rp)</label>
                  <input type="number" required value={form.jumlah} onChange={e => setForm({...form, jumlah: parseInt(e.target.value) || ''})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Bulan</label>
                  <Dropdown value={String(form.bulan)} onChange={v => setForm({...form, bulan: parseInt(v)})} options={namaBulanFull.slice(1).map((b, i) => ({value: String(i+1), label: b}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tahun</label>
                  <input type="number" required value={form.tahun} onChange={e => setForm({...form, tahun: parseInt(e.target.value)})} className={inputClass} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 shadow-sm cursor-pointer">{editingId ? 'Simpan' : 'Tambahkan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
