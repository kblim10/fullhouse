import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineDocumentReport, HiOutlineTrendingUp, HiOutlineTrendingDown } from 'react-icons/hi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function ReportPage() {
  const [yearSummary, setYearSummary] = useState(null);
  const [monthDetail, setMonthDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [tahun, setTahun] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => { fetchYearSummary(); }, [tahun]);
  useEffect(() => { if (selectedMonth) fetchMonthDetail(); }, [selectedMonth, tahun]);

  const fetchYearSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/year-summary', { params: { tahun } });
      setYearSummary(res.data);
    } catch { toast.error('Gagal memuat laporan tahunan'); }
    finally { setLoading(false); }
  };

  const fetchMonthDetail = async () => {
    try {
      const res = await api.get('/reports/month-detail', { params: { tahun, bulan: selectedMonth } });
      setMonthDetail(res.data);
    } catch { toast.error('Gagal memuat detail bulan'); }
  };

  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);
  const namaBulan = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const namaBulanShort = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

  const months = (yearSummary?.data || []).map(m => ({
    ...m,
    pemasukan: Number(m.pemasukan) || 0,
    pengeluaran: Number(m.pengeluaran) || 0,
  }));
  const totalIncome = months.reduce((s, m) => s + m.pemasukan, 0);
  const totalExpense = months.reduce((s, m) => s + m.pengeluaran, 0);
  const alltimeSaldo = Number(yearSummary?.alltime_saldo) || 0;

  const barData = {
    labels: months.map(m => namaBulanShort[m.bulan]),
    datasets: [
      { label: 'Pemasukan', data: months.map(m => m.pemasukan || 0), backgroundColor: 'rgba(16, 185, 129, 0.8)', borderRadius: 6, barPercentage: 0.6 },
      { label: 'Pengeluaran', data: months.map(m => m.pengeluaran || 0), backgroundColor: 'rgba(239, 68, 68, 0.8)', borderRadius: 6, barPercentage: 0.6 },
    ],
  };
  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 20, font: { size: 12 } } }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${formatRupiah(c.raw)}` } } },
    scales: { y: { beginAtZero: true, ticks: { callback: (v) => (v / 1000000).toFixed(1) + 'jt' }, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } },
  };

  let cumulative = 0;
  const lineData = {
    labels: months.map(m => namaBulanShort[m.bulan]),
    datasets: [{
      label: 'Saldo Kumulatif', fill: true,
      data: months.map(m => { cumulative += (m.pemasukan || 0) - (m.pengeluaran || 0); return cumulative; }),
      borderColor: 'rgb(16, 185, 129)', backgroundColor: 'rgba(16, 185, 129, 0.1)', tension: 0.4, pointBackgroundColor: 'rgb(16, 185, 129)', pointRadius: 4,
    }],
  };
  const lineOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => formatRupiah(c.raw) } } },
    scales: { y: { ticks: { callback: (v) => (v / 1000000).toFixed(1) + 'jt' }, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <svg className="animate-spin w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <p className="text-sm text-slate-500">Ringkasan pemasukan dan pengeluaran</p>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600">Tahun:</label>
          <input type="number" value={tahun} onChange={e => { setTahun(parseInt(e.target.value)); setSelectedMonth(null); setMonthDetail(null); }}
            className="w-24 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><HiOutlineTrendingUp className="w-5 h-5" /></div>
            <p className="text-sm text-emerald-100">Total Pemasukan</p>
          </div>
          <p className="text-xl font-bold">{formatRupiah(totalIncome)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><HiOutlineTrendingDown className="w-5 h-5" /></div>
            <p className="text-sm text-red-100">Total Pengeluaran</p>
          </div>
          <p className="text-xl font-bold">{formatRupiah(totalExpense)}</p>
        </div>
        <div className={`bg-gradient-to-br ${alltimeSaldo >= 0 ? 'from-blue-500 to-blue-600' : 'from-amber-500 to-amber-600'} text-white rounded-2xl p-5 shadow-sm`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><HiOutlineDocumentReport className="w-5 h-5" /></div>
            <p className="text-sm text-blue-100">Saldo Total</p>
          </div>
          <p className="text-xl font-bold">{formatRupiah(alltimeSaldo)}</p>
          <p className="text-xs text-white/70 mt-1">Akumulasi semua tahun</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Pemasukan vs Pengeluaran</h3>
          <div className="h-64"><Bar data={barData} options={barOpts} /></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Saldo Kumulatif</h3>
          <div className="h-64"><Line data={lineData} options={lineOpts} /></div>
        </div>
      </div>

      {/* Monthly Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Rincian per Bulan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Bulan</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Pemasukan</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Pengeluaran</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Selisih</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {months.map(m => {
                const selisih = (m.pemasukan || 0) - (m.pengeluaran || 0);
                return (
                  <tr key={m.bulan} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-700">{namaBulan[m.bulan]}</td>
                    <td className="px-5 py-3 text-right text-emerald-600 font-medium">{formatRupiah(m.pemasukan)}</td>
                    <td className="px-5 py-3 text-right text-red-500 font-medium">{formatRupiah(m.pengeluaran)}</td>
                    <td className={`px-5 py-3 text-right font-medium ${selisih >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>{formatRupiah(selisih)}</td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => setSelectedMonth(m.bulan)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          selectedMonth === m.bulan ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}>
                        {selectedMonth === m.bulan ? 'Dipilih' : 'Lihat'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50/50">
                <td className="px-5 py-3 font-bold text-slate-700">Total</td>
                <td className="px-5 py-3 text-right font-bold text-emerald-600">{formatRupiah(totalIncome)}</td>
                <td className="px-5 py-3 text-right font-bold text-red-500">{formatRupiah(totalExpense)}</td>
                <td className={`px-5 py-3 text-right font-bold ${totalIncome - totalExpense >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>{formatRupiah(totalIncome - totalExpense)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Month Detail */}
      {monthDetail && selectedMonth && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Detail {namaBulan[selectedMonth]} {tahun}</h3>
            <button onClick={() => { setSelectedMonth(null); setMonthDetail(null); }} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Tutup</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            {/* Payments */}
            <div className="p-5">
              <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3">Pemasukan (Iuran)</h4>
              {(monthDetail.pemasukan || []).length === 0 ? (
                <p className="text-sm text-slate-400 py-4">Tidak ada pemasukan</p>
              ) : (
                <div className="space-y-2">
                  {(monthDetail.pemasukan || []).map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-emerald-50/50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{p.house?.nomor_rumah} — {p.resident?.nama_lengkap}</p>
                        <p className="text-xs text-slate-400 capitalize">{p.jenis_iuran} · {p.status === 'lunas' ? '✓ Lunas' : '○ Belum'}</p>
                      </div>
                      <p className="text-sm font-medium text-emerald-600">{formatRupiah(p.jumlah)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Expenses */}
            <div className="p-5">
              <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-3">Pengeluaran</h4>
              {(monthDetail.pengeluaran || []).length === 0 ? (
                <p className="text-sm text-slate-400 py-4">Tidak ada pengeluaran</p>
              ) : (
                <div className="space-y-2">
                  {(monthDetail.pengeluaran || []).map((e, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-red-50/50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{e.kategori}</p>
                        <p className="text-xs text-slate-400">{e.deskripsi || '-'}</p>
                      </div>
                      <p className="text-sm font-medium text-red-500">{formatRupiah(e.jumlah)}</p>
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
