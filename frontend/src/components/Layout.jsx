import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineHome, HiOutlineUsers, HiOutlineOfficeBuilding,
  HiOutlineCreditCard, HiOutlineCash, HiOutlineChartBar,
  HiOutlineLogout, HiOutlineMenu
} from 'react-icons/hi';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: HiOutlineHome },
  { path: '/penghuni', label: 'Penghuni', icon: HiOutlineUsers },
  { path: '/rumah', label: 'Rumah', icon: HiOutlineOfficeBuilding },
  { path: '/pembayaran', label: 'Pembayaran', icon: HiOutlineCreditCard },
  { path: '/pengeluaran', label: 'Pengeluaran', icon: HiOutlineCash },
  { path: '/laporan', label: 'Laporan', icon: HiOutlineChartBar },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const item = menuItems.find(m => m.path === location.pathname);
    return item?.label || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always fixed */}
      <aside className={`
        fixed inset-y-0 left-0 z-50
        w-[260px] bg-white border-r border-slate-200
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo area */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">Full-House</h1>
              <p className="text-[11px] text-slate-400 leading-tight">Administrasi RT</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu Utama</p>
          <div className="space-y-0.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all
                    ${isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                  `}
                >
                  <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-emerald-600' : ''}`} />
                  {item.label}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout at bottom */}
        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full
              text-[13px] font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
          >
            <HiOutlineLogout className="w-[18px] h-[18px]" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main area — left margin matches sidebar width */}
      <div className="lg:ml-[260px] flex flex-col min-h-screen">
        {/* Top header — sticky */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200/80 px-4 lg:px-6">
          <div className="flex items-center h-16 gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
            >
              <HiOutlineMenu className="w-5 h-5" />
            </button>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-800">{getPageTitle()}</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">{user?.name}</p>
                <p className="text-[11px] text-slate-400">Ketua RT</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-4 lg:px-6 py-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 text-center">Full-House v1.0 &copy; 2026</p>
        </footer>
      </div>
    </div>
  );
}
