import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiX, HiOutlineOfficeBuilding, HiOutlineUserAdd, HiOutlineUserRemove, HiOutlineClock, HiOutlineCash } from 'react-icons/hi';
import Dropdown from '../components/Dropdown';
import SearchInput from '../components/SearchInput';

export default function HousePage() {
  const [houses, setHouses] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [showHouseModal, setShowHouseModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [houseForm, setHouseForm] = useState({ nomor_rumah: '', alamat: '', status_rumah: 'tidak_dihuni' });
  const [assignForm, setAssignForm] = useState({ resident_id: '', tanggal_masuk: new Date().toISOString().split('T')[0] });

  useEffect(() => { fetchHouses(); fetchAllResidents(); }, [page]);

  const fetchHouses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/houses', { params: { page, per_page: 21 } });
      setHouses(res.data.data || []);
      setMeta(res.data.meta || res.data);
    } catch { toast.error('Gagal memuat data rumah'); }
    finally { setLoading(false); }
  };

  const fetchAllResidents = async () => {
    try {
      const res = await api.get('/residents', { params: { per_page: 100 } });
      setResidents(res.data.data || []);
    } catch {}
  };

  const openAdd = () => { setHouseForm({ nomor_rumah: '', alamat: '', status_rumah: 'tidak_dihuni' }); setEditingId(null); setShowHouseModal(true); };
  const openEdit = (h) => { setHouseForm({ nomor_rumah: h.nomor_rumah, alamat: h.alamat || '', status_rumah: h.status_rumah }); setEditingId(h.id); setShowHouseModal(true); };

  const handleSubmitHouse = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/houses/${editingId}`, houseForm);
        toast.success('Data rumah berhasil diubah');
      } else {
        await api.post('/houses', houseForm);
        toast.success('Rumah berhasil ditambahkan');
      }
      setShowHouseModal(false); fetchHouses();
    } catch (err) { toast.error(err.response?.data?.message || 'Terjadi kesalahan'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus rumah ini?')) return;
    try { await api.delete(`/houses/${id}`); toast.success('Rumah berhasil dihapus'); fetchHouses(); }
    catch { toast.error('Gagal menghapus rumah'); }
  };

  const openAssign = (house) => {
    setSelectedHouse(house);
    setAssignForm({ resident_id: '', tanggal_masuk: new Date().toISOString().split('T')[0] });
    setShowAssignModal(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/houses/${selectedHouse.id}/assign-resident`, assignForm);
      toast.success('Penghuni berhasil ditempatkan');
      setShowAssignModal(false); fetchHouses();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menempatkan penghuni'); }
  };

  const handleRemove = async (houseId, residentId, residentName) => {
    if (!confirm(`Keluarkan ${residentName} dari rumah ini?`)) return;
    try {
      await api.post(`/houses/${houseId}/remove-resident`, { resident_id: residentId });
      toast.success(`${residentName} berhasil dikeluarkan`);
      fetchHouses();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal mengeluarkan penghuni'); }
  };

  const openHistory = async (house) => {
    setSelectedHouse(house);
    try {
      const res = await api.get(`/houses/${house.id}/resident-history`);
      setHistoryData(res.data);
    } catch { setHistoryData([]); }
    setShowHistoryModal(true);
  };

  const openPaymentHistory = async (house) => {
    setSelectedHouse(house);
    try {
      const res = await api.get(`/houses/${house.id}/payment-history`);
      setPaymentData(res.data.data || res.data);
    } catch { setPaymentData([]); }
    setShowPaymentModal(true);
  };

  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <p className="text-sm text-slate-500">Kelola data rumah dan penghuni</p>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer">
          <HiPlus className="w-4 h-4" /> Tambah Rumah
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : houses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-20 text-slate-400">
          <HiOutlineOfficeBuilding className="w-12 h-12 mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">Belum ada data rumah</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {houses.map(house => {
            const activeResidents = house.active_resident || [];
            const isOccupied = house.status_rumah === 'dihuni' && activeResidents.length > 0;
            return (
              <div key={house.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className={`h-1.5 ${isOccupied ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{house.nomor_rumah}</h3>
                      {house.alamat && <p className="text-xs text-slate-400 mt-0.5">{house.alamat}</p>}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                      isOccupied ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isOccupied ? `${activeResidents.length} Penghuni` : 'Kosong'}
                    </span>
                  </div>

                  {isOccupied ? (
                    <div className="space-y-2 mb-4">
                      {activeResidents.map(resident => (
                        <div key={resident.id} className="bg-slate-50 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-emerald-700 font-bold text-xs">{resident.nama_lengkap?.charAt(0)?.toUpperCase()}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-700 truncate">{resident.nama_lengkap}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                                {resident.nomor_telepon || 'Belum ada no. telp'}
                              </p>
                            </div>
                            <button onClick={() => handleRemove(house.id, resident.id, resident.nama_lengkap)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0" title="Keluarkan">
                              <HiOutlineUserRemove className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-3 mb-4 text-center">
                      <p className="text-xs text-slate-400">Rumah belum ada penghuni</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => openAssign(house)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer">
                      <HiOutlineUserAdd className="w-3.5 h-3.5" /> Tempatkan
                    </button>
                    <button onClick={() => openHistory(house)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                      <HiOutlineClock className="w-3.5 h-3.5" /> Histori
                    </button>
                    <button onClick={() => openPaymentHistory(house)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer">
                      <HiOutlineCash className="w-3.5 h-3.5" /> Bayar
                    </button>
                    <button onClick={() => openEdit(house)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer ml-auto">
                      <HiPencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(house.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer">
                      <HiTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer ${page === p ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100 bg-white border border-slate-200'}`}>{p}</button>
          ))}
        </div>
      )}

      {/* House Modal */}
      {showHouseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowHouseModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">{editingId ? 'Edit Rumah' : 'Tambah Rumah'}</h3>
              <button onClick={() => setShowHouseModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><HiX className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmitHouse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomor Rumah</label>
                <input type="text" required value={houseForm.nomor_rumah} onChange={e => setHouseForm({...houseForm, nomor_rumah: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white" placeholder="Contoh: A-01" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat</label>
                <input type="text" value={houseForm.alamat} onChange={e => setHouseForm({...houseForm, alamat: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white" placeholder="Opsional" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowHouseModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 shadow-sm cursor-pointer">{editingId ? 'Simpan' : 'Tambahkan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowAssignModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Tempatkan Penghuni — {selectedHouse?.nomor_rumah}</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><HiX className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAssign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Pilih Penghuni</label>
                <SearchInput value={assignForm.resident_id} onChange={v => setAssignForm({...assignForm, resident_id: v})} placeholder="Ketik nama penghuni..." options={residents.map(r => ({value: String(r.id), label: r.nama_lengkap}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Masuk</label>
                <input type="date" required value={assignForm.tanggal_masuk} onChange={e => setAssignForm({...assignForm, tanggal_masuk: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 shadow-sm cursor-pointer">Tempatkan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Histori Penghuni — {selectedHouse?.nomor_rumah}</h3>
              <button onClick={() => setShowHistoryModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><HiX className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {historyData.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Belum ada histori penghuni</p>
              ) : (
                <div className="space-y-3">
                  {historyData.map((h, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${h.is_active ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm text-slate-700">{h.resident?.nama_lengkap}</p>
                        {h.is_active && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Aktif</span>}
                      </div>
                      <p className="text-xs text-slate-400">Masuk: {new Date(h.tanggal_masuk).toLocaleDateString('id-ID', {day:'2-digit',month:'2-digit',year:'2-digit'})} {h.tanggal_keluar ? `· Keluar: ${new Date(h.tanggal_keluar).toLocaleDateString('id-ID', {day:'2-digit',month:'2-digit',year:'2-digit'})}` : ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Pembayaran — {selectedHouse?.nomor_rumah}</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"><HiX className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {paymentData.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Belum ada data pembayaran</p>
              ) : (
                <div className="space-y-2">
                  {paymentData.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="text-sm font-medium text-slate-700 capitalize">{p.jenis_iuran} — {p.bulan}/{p.tahun}</p>
                        <p className="text-xs text-slate-400">{p.resident?.nama_lengkap}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-700">{formatRupiah(p.jumlah)}</p>
                        <span className={`text-xs font-medium ${p.status === 'lunas' ? 'text-emerald-600' : 'text-red-500'}`}>{p.status === 'lunas' ? 'Lunas' : 'Belum'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
