import { useState, useEffect } from 'react';
import { Bell, Phone, Mail, Calendar, RefreshCw, CheckCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  Prospecting: '#6B7280',
  Contacted: '#3A86FF',
  Interested: '#10B981',
  'Meeting Set': '#8B5CF6',
  'Proposal Sent': '#F59E0B',
  'Closed Won': '#059669',
  'Closed Lost': '#EF4444',
};

function DaysBadge({ days }) {
  if (days === 0) return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">Due Today</span>;
  if (days > 0) return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">{days}d overdue</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Due in {Math.abs(days)}d</span>;
}

function RescheduleModal({ lead, onClose, onRescheduled }) {
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!date) { toast.error('Please select a date'); return; }
    setSaving(true);
    try {
      await api.updateLead(lead.id, { followup_date: date });
      toast.success('Follow-up rescheduled!');
      onRescheduled(lead.id, date);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Reschedule Follow-Up</h3>
        <p className="text-sm text-gray-400 mb-4">{lead.business_name}</p>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-60"
            style={{ backgroundColor: '#3A86FF' }}
          >
            {saving ? 'Saving…' : 'Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FollowUpQueue() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const load = () => {
    setLoading(true);
    api.getFollowUps()
      .then(data => { setLeads(data); setLoading(false); })
      .catch(e => { toast.error(e.message); setLoading(false); });
  };

  useEffect(load, []);

  const markContacted = async (lead) => {
    try {
      await api.updateLead(lead.id, { deal_status: 'Contacted', outreach_status: 'Replied', followup_date: '' });
      setLeads(prev => prev.filter(l => l.id !== lead.id));
      toast.success(`${lead.business_name} marked as Contacted`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRescheduled = (id, date) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, followup_date: date } : l));
    load();
  };

  const daysDiff = (dateStr) => {
    const d = new Date(dateStr);
    const t = new Date(today);
    return Math.floor((t - d) / (1000 * 60 * 60 * 24));
  };

  const METHOD_ICON = {
    Call: <Phone size={13} />,
    Email: <Mail size={13} />,
    DM: <MessageSquare size={13} />,
    WhatsApp: <MessageSquare size={13} />,
    'In-Person': <Calendar size={13} />,
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Follow-Up Queue</h1>
            {leads.length > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                {leads.length} pending
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1">Leads that need follow-up today or are overdue</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">All caught up!</h2>
          <p className="text-sm text-gray-400">No overdue or due-today follow-ups. Great work!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-0 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <div className="col-span-3">Business</div>
            <div className="col-span-2">Contact</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-1 text-center">Method</div>
            <div className="col-span-1 text-center">Overdue</div>
            <div className="col-span-4 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-50">
            {leads.map(lead => {
              const days = daysDiff(lead.followup_date);
              const statusColor = STATUS_COLORS[lead.deal_status] || '#6B7280';
              return (
                <div key={lead.id} className={`grid grid-cols-12 gap-0 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors ${days > 0 ? 'bg-red-50/30' : days === 0 ? 'bg-orange-50/30' : ''}`}>
                  {/* Business */}
                  <div className="col-span-3">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{lead.business_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{lead.industry}</p>
                  </div>

                  {/* Contact */}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-700 leading-tight">{lead.contact_name || '—'}</p>
                    {lead.phone && <p className="text-xs text-blue-500 mt-0.5 font-mono">{lead.phone}</p>}
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex justify-center">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: `${statusColor}18`, color: statusColor }}
                    >
                      {lead.deal_status}
                    </span>
                  </div>

                  {/* Method */}
                  <div className="col-span-1 flex justify-center">
                    {lead.followup_method ? (
                      <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg font-medium">
                        {METHOD_ICON[lead.followup_method] || <Bell size={13} />}
                        {lead.followup_method}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </div>

                  {/* Days badge */}
                  <div className="col-span-1 flex justify-center">
                    <DaysBadge days={days} />
                  </div>

                  {/* Actions */}
                  <div className="col-span-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => markContacted(lead)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <CheckCircle size={13} /> Mark Contacted
                    </button>
                    <button
                      onClick={() => setRescheduleTarget(lead)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <Calendar size={13} /> Reschedule
                    </button>
                    <button
                      onClick={() => navigate(`/audit/${lead.id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      View Lead
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {rescheduleTarget && (
        <RescheduleModal
          lead={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onRescheduled={handleRescheduled}
        />
      )}
    </div>
  );
}
