import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiX, HiSearch, HiOutlineUsers, HiOutlinePhone, HiOutlineIdentification, HiOutlinePhotograph, HiEye } from 'react-icons/hi';
import Dropdown from '../components/Dropdown';

const STORAGE_URL = '/storage';

export default function ResidentPage() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    nama_lengkap: '', nomor_telepon: '', status_penghuni: 'tetap', status_menikah: false, foto_ktp: null,
  });
  const [existingKtp, setExistingKtp] = useState(null);
  const [viewKtp, setViewKtp] = useState(null);

  useEffect(() => { fetchResidents(); }, [page, search, statusFilter]);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/residents', { params });
      setResidents(res.data.data || []);
      setMeta(res.data.meta || res.data);
    } catch { toast.error('Gagal memuat data penghuni'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm({ nama_lengkap: '', nomor_telepon: '', status_penghuni: 'tetap', status_menikah: false, foto_ktp: null });
    setExistingKtp(null);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (r) => {
    setForm({
      nama_lengkap: r.nama_lengkap, nomor_telepon: r.nomor_telepon || '',
      status_penghuni: r.status_penghuni, status_menikah: r.status_menikah ? true : false, foto_ktp: null,
    });
    setExistingKtp(r.foto_ktp || null);
    setEditingId(r.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('nama_lengkap', form.nama_lengkap);
    fd.append('nomor_telepon', form.nomor_telepon);
    fd.append('status_penghuni', form.status_penghuni);
    fd.append('status_menikah', form.status_menikah ? '1' : '0');
    if (form.foto_ktp) fd.append('foto_ktp', form.foto_ktp);

    try {
      if (editingId) {
        fd.append('_method', 'PUT');
        await api.post(`/residents/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Data penghuni berhasil diubah');
      } else {
        await api.post('/residents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Penghuni berhasil ditambahkan');
      }
      setShowModal(false);
      fetchResidents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Yakin ingin menghapus data ${name}?`)) return;
    try {
      await api.delete(`/residents/${id}`);
      toast.success('Data penghuni berhasil dihapus');
      fetchResidents();
    } catch { toast.error('Gagal menghapus data penghuni'); }
  };

  return (
    <div className="space-y-5">
      {/* Header + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <p className="text-sm text-slate-500">Kelola data penghuni perumahan</p>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer">
          <HiPlus className="w-4 h-4" /> Tambah Penghuni
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" placeholder="Cari nama penghuni..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
          <Dropdown
            className="w-44"
            value={statusFilter}
            onChange={v => { setStatusFilter(v); setPage(1); }}
            placeholder="Semua Status"
            options={[{value: '', label: 'Semua Status'}, {value: 'tetap', label: 'Tetap'}, {value: 'kontrak', label: 'Kontrak'}]}
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
        ) : residents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <HiOutlineUsers className="w-12 h-12 mb-3 text-slate-300" />
            <p className="font-medium text-slate-500">Belum ada data penghuni</p>
            <p className="text-sm mt-1">Tambahkan penghuni baru untuk memulai</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Nama</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Telepon</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menikah</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rumah</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">KTP</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {residents.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-700 font-semibold text-xs">{r.nama_lengkap?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-slate-700">{r.nama_lengkap}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{r.nomor_telepon || '-'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                        r.status_penghuni === 'tetap' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {r.status_penghuni === 'tetap' ? 'Tetap' : 'Kontrak'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{r.status_menikah ? 'Ya' : 'Belum'}</td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {r.active_house?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {r.active_house.map(h => (
                            <span key={h.id} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700">
                              {h.nomor_rumah}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {r.foto_ktp ? (
                        <button onClick={() => setViewKtp(`${STORAGE_URL}/${r.foto_ktp}`)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer" title="Lihat KTP">
                          <HiEye className="w-3.5 h-3.5" /> Lihat
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer" title="Edit">
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(r.id, r.nama_lengkap)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer" title="Hapus">
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Menampilkan {meta.from}-{meta.to} dari {meta.total}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    page === p ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                  }`}>
                  {p}
                </button>
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
              <h3 className="text-lg font-semibold text-slate-800">{editingId ? 'Edit Penghuni' : 'Tambah Penghuni'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <HiX className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap</label>
                <input type="text" required value={form.nama_lengkap} onChange={e => setForm({...form, nama_lengkap: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  placeholder="Masukkan nama lengkap" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomor Telepon</label>
                <input type="text" value={form.nomor_telepon} onChange={e => setForm({...form, nomor_telepon: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  placeholder="08xxxx" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status Penghuni</label>
                  <Dropdown value={form.status_penghuni} onChange={v => setForm({...form, status_penghuni: v})} options={[{value: 'tetap', label: 'Tetap'}, {value: 'kontrak', label: 'Kontrak'}]} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status Menikah</label>
                  <Dropdown value={form.status_menikah ? 'true' : 'false'} onChange={v => setForm({...form, status_menikah: v === 'true'})} options={[{value: 'false', label: 'Belum Menikah'}, {value: 'true', label: 'Sudah Menikah'}]} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Foto KTP</label>
                {existingKtp && !form.foto_ktp && (
                  <div className="mb-2 relative group">
                    <img src={`${STORAGE_URL}/${existingKtp}`} alt="KTP" className="w-full h-36 object-cover rounded-xl border border-slate-200" />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Pilih file baru untuk mengganti</span>
                    </div>
                  </div>
                )}
                {form.foto_ktp && (
                  <div className="mb-2">
                    <img src={URL.createObjectURL(form.foto_ktp)} alt="Preview" className="w-full h-36 object-cover rounded-xl border border-slate-200" />
                    <button type="button" onClick={() => setForm({...form, foto_ktp: null})} className="mt-1 text-xs text-red-500 hover:text-red-700 cursor-pointer">Hapus file baru</button>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={e => setForm({...form, foto_ktp: e.target.files[0]})}
                  className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 file:cursor-pointer cursor-pointer" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer">
                  Batal
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer">
                  {editingId ? 'Simpan Perubahan' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* KTP Lightbox */}
      {viewKtp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setViewKtp(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewKtp(null)} className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer">
              <HiX className="w-4 h-4 text-slate-600" />
            </button>
            <img src={viewKtp} alt="Foto KTP" className="w-full rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
