import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiX, HiOutlineRefresh, HiOutlineCreditCard } from 'react-icons/hi';
import Dropdown from '../components/Dropdown';
import SearchInput from '../components/SearchInput';

export default function PaymentPage() {
  const [payments, setPayments] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [filterBulan, setFilterBulan] = useState('');
  const [filterTahun, setFilterTahun] = useState(currentYear);
  const [filterJenis, setFilterJenis] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({
    house_id: '', jenis_iuran: 'satpam', bulan: currentMonth,
    tahun: currentYear, jumlah: 100000, status: 'lunas', tanggal_bayar: new Date().toISOString().split('T')[0],
  });
  const [bulkForm, setBulkForm] = useState({ house_id: '', jenis_iuran: 'satpam', tahun: currentYear, jumlah: 100000 });
  const [generateForm, setGenerateForm] = useState({ bulan: currentMonth, tahun: currentYear, jenis_iuran: 'satpam', jumlah: 100000 });

  useEffect(() => { fetchPayments(); }, [page, filterBulan, filterTahun, filterJenis, filterStatus]);
  useEffect(() => { fetchHouses(); }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (filterBulan) params.bulan = filterBulan;
      if (filterTahun) params.tahun = filterTahun;
      if (filterJenis) params.jenis_iuran = filterJenis;
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/payments', { params });
      setPayments(res.data.data || []);
      setMeta(res.data.meta || res.data);
    } catch { toast.error('Gagal memuat data pembayaran'); }
    finally { setLoading(false); }
  };

  const fetchHouses = async () => { try { const r = await api.get('/houses', { params: { per_page: 100 } }); setHouses(r.data.data || []); } catch {} };

  const getHouseResidents = (houseId) => {
    if (!houseId) return [];
    const house = houses.find(h => String(h.id) === String(houseId));
    return house?.active_resident || [];
  };

  const openAdd = () => {
    setForm({ house_id: '', jenis_iuran: 'satpam', bulan: currentMonth, tahun: currentYear, jumlah: 100000, status: 'lunas', tanggal_bayar: new Date().toISOString().split('T')[0] });
    setEditingId(null); setShowModal(true);
  };

  const openEdit = (p) => {
    setForm({ house_id: String(p.house_id || ''), jenis_iuran: p.jenis_iuran, bulan: p.bulan, tahun: p.tahun, jumlah: p.jumlah, status: p.status, tanggal_bayar: p.tanggal_bayar ? p.tanggal_bayar.substring(0, 10) : '' });
    setEditingId(p.id); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, resident_id: null };
      if (editingId) { await api.put(`/payments/${editingId}`, payload); toast.success('Pembayaran berhasil diubah'); }
      else { await api.post('/payments', payload); toast.success('Pembayaran berhasil ditambahkan'); }
      setShowModal(false); fetchPayments();
    } catch (err) { toast.error(err.response?.data?.message || 'Terjadi kesalahan'); }
  };

  const handleBulk = async (e) => {
    e.preventDefault();
    try { const payload = { ...bulkForm, resident_id: null }; await api.post('/payments-bulk', payload); toast.success('Pembayaran tahunan berhasil dibuat'); setShowBulkModal(false); fetchPayments(); }
    catch (err) { toast.error(err.response?.data?.message || 'Terjadi kesalahan'); }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try { await api.post('/payments-generate', generateForm); toast.success('Tagihan bulanan berhasil digenerate'); setShowGenerateModal(false); fetchPayments(); }
    catch (err) { toast.error(err.response?.data?.message || 'Terjadi kesalahan'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus pembayaran ini?')) return;
    try { await api.delete(`/payments/${id}`); toast.success('Pembayaran berhasil dihapus'); fetchPayments(); }
    catch { toast.error('Gagal menghapus pembayaran'); }
  };

  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
  const namaBulan = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  const namaBulanFull = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <p className="text-sm text-slate-500">Kelola iuran bulanan penghuni</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowGenerateModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors shadow-sm cursor-pointer">
            <HiOutlineRefresh className="w-4 h-4" /> Generate
          </button>
          <button onClick={() => setShowBulkModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">
            <HiOutlineCreditCard className="w-4 h-4" /> Bayar Tahunan
          </button>
          <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer">
            <HiPlus className="w-4 h-4" /> Tambah
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
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
          <Dropdown
            className="w-40"
            value={filterJenis}
            onChange={v => { setFilterJenis(v); setPage(1); }}
            placeholder="Semua Jenis"
            options={[{value: '', label: 'Semua Jenis'}, {value: 'satpam', label: 'Satpam'}, {value: 'kebersihan', label: 'Kebersihan'}]}
          />
          <Dropdown
            className="w-40"
            value={filterStatus}
            onChange={v => { setFilterStatus(v); setPage(1); }}
            placeholder="Semua Status"
            options={[{value: '', label: 'Semua Status'}, {value: 'lunas', label: 'Lunas'}, {value: 'belum', label: 'Belum Bayar'}]}
          />
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
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <HiOutlineCreditCard className="w-12 h-12 mb-3 text-slate-300" />
            <p className="font-medium text-slate-500">Tidak ada data pembayaran</p>
            <p className="text-sm mt-1">Gunakan tombol Generate atau Tambah untuk membuat data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rumah</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Penghuni</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Jenis</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Periode</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Jumlah</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-700">{p.house?.nomor_rumah}</td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {p.resident ? p.resident.nama_lengkap : (
                        p.house?.active_resident?.length > 0
                          ? p.house.active_resident.map(r => r.nama_lengkap).join(', ')
                          : <span className="italic text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${
                        p.jenis_iuran === 'satpam' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>{p.jenis_iuran}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{namaBulan[p.bulan]} {p.tahun}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-700">{formatRupiah(p.jumlah)}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                        p.status === 'lunas' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                      }`}>{p.status === 'lunas' ? 'Lunas' : 'Belum'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"><HiPencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"><HiTrash className="w-4 h-4" /></button>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">{editingId ? 'Edit Pembayaran' : 'Tambah Pembayaran'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><HiX className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Rumah</label>
                <SearchInput value={form.house_id} onChange={v => setForm({...form, house_id: v})} placeholder="Ketik nomor rumah..." options={houses.map(h => ({value: String(h.id), label: h.nomor_rumah}))} />
                {form.house_id && (
                  <div className="mt-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-medium text-slate-400">Penghuni:</span>
                    <span className="text-sm text-slate-700 ml-1.5">{getHouseResidents(form.house_id).map(r => r.nama_lengkap).join(', ') || <span className="italic text-slate-400">Belum ada penghuni</span>}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Jenis</label>
                  <Dropdown value={form.jenis_iuran} onChange={v => setForm({...form, jenis_iuran: v})} options={[{value: 'satpam', label: 'Satpam'}, {value: 'kebersihan', label: 'Kebersihan'}]} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Bulan</label>
                  <Dropdown value={String(form.bulan)} onChange={v => setForm({...form, bulan: parseInt(v)})} options={namaBulanFull.slice(1).map((b, i) => ({value: String(i+1), label: b}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tahun</label>
                  <input type="number" value={form.tahun} onChange={e => setForm({...form, tahun: parseInt(e.target.value)})} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Jumlah (Rp)</label>
                  <input type="number" required value={form.jumlah} onChange={e => setForm({...form, jumlah: parseInt(e.target.value)})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                  <Dropdown value={form.status} onChange={v => setForm({...form, status: v})} options={[{value: 'lunas', label: 'Lunas'}, {value: 'belum', label: 'Belum'}]} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tgl Bayar</label>
                  <input type="date" value={form.tanggal_bayar} onChange={e => setForm({...form, tanggal_bayar: e.target.value})} className={inputClass} />
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

      {/* Bulk Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowBulkModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Bayar Tahunan (12 Bulan)</h3>
              <button onClick={() => setShowBulkModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><HiX className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleBulk} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Rumah</label>
                <SearchInput value={bulkForm.house_id} onChange={v => setBulkForm({...bulkForm, house_id: v})} placeholder="Ketik nomor rumah..." options={houses.map(h => ({value: String(h.id), label: h.nomor_rumah}))} />
                {bulkForm.house_id && (
                  <div className="mt-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-medium text-slate-400">Penghuni:</span>
                    <span className="text-sm text-slate-700 ml-1.5">{getHouseResidents(bulkForm.house_id).map(r => r.nama_lengkap).join(', ') || <span className="italic text-slate-400">Belum ada penghuni</span>}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Jenis</label>
                  <Dropdown value={bulkForm.jenis_iuran} onChange={v => setBulkForm({...bulkForm, jenis_iuran: v})} options={[{value: 'satpam', label: 'Satpam'}, {value: 'kebersihan', label: 'Kebersihan'}]} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tahun</label>
                  <input type="number" required value={bulkForm.tahun} onChange={e => setBulkForm({...bulkForm, tahun: parseInt(e.target.value)})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Jumlah/bln</label>
                  <input type="number" required value={bulkForm.jumlah} onChange={e => setBulkForm({...bulkForm, jumlah: parseInt(e.target.value)})} className={inputClass} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowBulkModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-sm cursor-pointer">Bayar 12 Bulan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowGenerateModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Generate Tagihan Bulanan</h3>
              <button onClick={() => setShowGenerateModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><HiX className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              <p className="text-sm text-slate-500 bg-amber-50 border border-amber-100 rounded-xl p-3">Generate tagihan otomatis untuk semua rumah yang dihuni pada bulan yang dipilih.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Bulan</label>
                  <Dropdown value={String(generateForm.bulan)} onChange={v => setGenerateForm({...generateForm, bulan: parseInt(v)})} options={namaBulanFull.slice(1).map((b, i) => ({value: String(i+1), label: b}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tahun</label>
                  <input type="number" required value={generateForm.tahun} onChange={e => setGenerateForm({...generateForm, tahun: parseInt(e.target.value)})} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Jenis Iuran</label>
                  <Dropdown value={generateForm.jenis_iuran} onChange={v => setGenerateForm({...generateForm, jenis_iuran: v})} options={[{value: 'satpam', label: 'Satpam'}, {value: 'kebersihan', label: 'Kebersihan'}]} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Jumlah (Rp)</label>
                  <input type="number" required value={generateForm.jumlah} onChange={e => setGenerateForm({...generateForm, jumlah: parseInt(e.target.value)})} className={inputClass} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowGenerateModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 shadow-sm cursor-pointer">Generate Tagihan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
