import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeadTracker from './pages/LeadTracker';
import AuditChecklist from './pages/AuditChecklist';
import ColdCallScript from './pages/ColdCallScript';
import EmailTemplates from './pages/EmailTemplates';
import FollowUpQueue from './pages/FollowUpQueue';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppShell() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><LeadTracker /></ProtectedRoute>} />
          <Route path="/audit/:id" element={<ProtectedRoute adminOnly><AuditChecklist /></ProtectedRoute>} />
          <Route path="/cold-call" element={<ProtectedRoute><ColdCallScript /></ProtectedRoute>} />
          <Route path="/email-templates" element={<ProtectedRoute><EmailTemplates /></ProtectedRoute>} />
          <Route path="/follow-up" element={<ProtectedRoute><FollowUpQueue /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
