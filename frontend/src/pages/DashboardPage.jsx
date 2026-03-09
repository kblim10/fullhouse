import { useState, useEffect } from 'react';
import api from '../services/api';
import { HiOutlineHome, HiOutlineUsers, HiOutlineCash, HiOutlineExclamation, HiOutlineTrendingUp, HiOutlineTrendingDown } from 'react-icons/hi';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
      setError(false);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  };

  const namaBulan = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-emerald-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-slate-400">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
          <HiOutlineExclamation className="w-8 h-8 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-slate-700 font-medium">Gagal memuat data</p>
          <p className="text-sm text-slate-400 mt-1">Terjadi kesalahan saat mengambil data dashboard</p>
        </div>
        <button onClick={fetchDashboard} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors cursor-pointer">
          Coba Lagi
        </button>
      </div>
    );
  }

  const saldo = (data?.pemasukan_bulan_ini || 0) - (data?.pengeluaran_bulan_ini || 0);

  const cards = [
    {
      title: 'Total Rumah',
      value: data?.total_rumah || 0,
      sub: `${data?.rumah_dihuni || 0} dihuni · ${data?.rumah_kosong || 0} kosong`,
      icon: HiOutlineHome,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Penghuni',
      value: data?.total_penghuni || 0,
      sub: 'Penghuni aktif terdaftar',
      icon: HiOutlineUsers,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: `Pemasukan`,
      value: formatRupiah(data?.pemasukan_bulan_ini),
      sub: `${data?.tagihan_sudah_bayar || 0} tagihan lunas`,
      icon: HiOutlineTrendingUp,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Belum Bayar',
      value: `${data?.tagihan_belum_bayar || 0} tagihan`,
      sub: `Periode ${namaBulan[data?.bulan]} ${data?.tahun}`,
      icon: HiOutlineExclamation,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-sm text-slate-500">
          Ringkasan data bulan <span className="font-medium text-slate-600">{namaBulan[data?.bulan]} {data?.tahun}</span>
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">{card.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <HiOutlineTrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-semibold text-slate-700">Pengeluaran</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">{formatRupiah(data?.pengeluaran_bulan_ini)}</p>
          <p className="text-xs text-slate-400 mt-2">Total pengeluaran {namaBulan[data?.bulan]} {data?.tahun}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-9 h-9 rounded-lg ${saldo >= 0 ? 'bg-emerald-50' : 'bg-red-50'} flex items-center justify-center`}>
              <HiOutlineCash className={`w-5 h-5 ${saldo >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
            </div>
            <h3 className="font-semibold text-slate-700">Saldo</h3>
          </div>
          <p className={`text-3xl font-bold ${saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatRupiah(saldo)}
          </p>
          <p className="text-xs text-slate-400 mt-2">Pemasukan dikurangi pengeluaran</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
          <h3 className="font-semibold text-emerald-100 text-sm">Info Perumahan</h3>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-emerald-100 text-sm">Rumah dihuni</span>
              <span className="font-bold text-lg">{data?.rumah_dihuni || 0}</span>
            </div>
            <div className="h-px bg-emerald-400/30" />
            <div className="flex justify-between items-center">
              <span className="text-emerald-100 text-sm">Rumah kosong</span>
              <span className="font-bold text-lg">{data?.rumah_kosong || 0}</span>
            </div>
            <div className="h-px bg-emerald-400/30" />
            <div className="flex justify-between items-center">
              <span className="text-emerald-100 text-sm">Total penghuni</span>
              <span className="font-bold text-lg">{data?.total_penghuni || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
