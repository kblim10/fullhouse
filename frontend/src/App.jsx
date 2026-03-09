import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ResidentPage from './pages/ResidentPage';
import HousePage from './pages/HousePage';
import PaymentPage from './pages/PaymentPage';
import ExpensePage from './pages/ExpensePage';
import ReportPage from './pages/ReportPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Memuat...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Memuat...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={
            <PublicRoute><LoginPage /></PublicRoute>
          } />
          <Route path="/" element={
            <PrivateRoute><DashboardPage /></PrivateRoute>
          } />
          <Route path="/penghuni" element={
            <PrivateRoute><ResidentPage /></PrivateRoute>
          } />
          <Route path="/rumah" element={
            <PrivateRoute><HousePage /></PrivateRoute>
          } />
          <Route path="/pembayaran" element={
            <PrivateRoute><PaymentPage /></PrivateRoute>
          } />
          <Route path="/pengeluaran" element={
            <PrivateRoute><ExpensePage /></PrivateRoute>
          } />
          <Route path="/laporan" element={
            <PrivateRoute><ReportPage /></PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
