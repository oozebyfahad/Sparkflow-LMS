import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LeadTracker from './pages/LeadTracker';
import AuditChecklist from './pages/AuditChecklist';
import ColdCallScript from './pages/ColdCallScript';
import EmailTemplates from './pages/EmailTemplates';
import FollowUpQueue from './pages/FollowUpQueue';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<LeadTracker />} />
            <Route path="/audit/:id" element={<AuditChecklist />} />
            <Route path="/cold-call" element={<ColdCallScript />} />
            <Route path="/email-templates" element={<EmailTemplates />} />
            <Route path="/follow-up" element={<FollowUpQueue />} />
          </Routes>
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' },
        }}
      />
    </BrowserRouter>
  );
}
