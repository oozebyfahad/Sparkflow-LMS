import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Search, ChevronUp, ChevronDown, X, ClipboardCheck, RefreshCw, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const DEAL_STATUSES = ['Prospecting', 'Contacted', 'Interested', 'Meeting Set', 'Proposal Sent', 'Closed Won', 'Closed Lost'];
const INDUSTRIES = ['Marketing', 'Real Estate', 'Food & Beverage', 'Technology', 'Healthcare', 'Fitness', 'Construction', 'Legal', 'Events', 'Beauty & Wellness', 'Education', 'Finance', 'Retail', 'Other'];
const CHANNELS = ['Cold Call', 'Email', 'LinkedIn', 'Instagram DM', 'Facebook', 'Referral', 'Walk-In', 'Other'];
const SERVICES = ['Social Media Management', 'SEO', 'Website Redesign', 'Video Production', 'Photography', 'Branding', 'Email Marketing', 'PPC Ads', 'Content Writing', 'Graphic Design'];
const FOLLOW_METHODS = ['Call', 'Email', 'DM', 'WhatsApp', 'In-Person'];

const STATUS_STYLES = {
  Prospecting: 'bg-gray-100 text-gray-600',
  Contacted: 'bg-blue-100 text-blue-700',
  Interested: 'bg-emerald-100 text-emerald-700',
  'Meeting Set': 'bg-purple-100 text-purple-700',
  'Proposal Sent': 'bg-orange-100 text-orange-700',
  'Closed Won': 'bg-green-100 text-green-800 font-bold ring-1 ring-green-300',
  'Closed Lost': 'bg-red-100 text-red-700',
};

const SCORE_COLOR = (v) => {
  const n = parseInt(v);
  if (!n) return 'text-gray-300';
  if (n >= 8) return 'text-green-600 font-semibold';
  if (n >= 5) return 'text-yellow-600 font-semibold';
  return 'text-red-500 font-semibold';
};

const BLANK_LEAD = {
  business_name: '', industry: '', website_score: '', social_score: '', branding_score: '', video_score: '',
  contact_name: '', email: '', phone: '', primary_service: '', secondary_service: '', package_value: '',
  outreach_channel: '', date_contacted: '', outreach_status: '', followup_date: '', followup_method: '',
  response_received: 'No', meeting_scheduled: 'No', proposal_sent: 'No', deal_status: 'Prospecting', notes: '',
};

function AddLeadModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ ...BLANK_LEAD });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.business_name.trim()) { toast.error('Business name is required'); return; }
    setSaving(true);
    try {
      const lead = await api.createLead(form);
      toast.success(`Lead "${lead.business_name}" added!`);
      onCreated(lead);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, children, full }) => (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );

  const inp = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent";
  const sel = `${inp} bg-white`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add New Lead</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Business Name *" full><input className={inp} value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder="Company name" /></Field>
            <Field label="Industry"><select className={sel} value={form.industry} onChange={e => set('industry', e.target.value)}><option value="">Select…</option>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select></Field>
            <Field label="Contact Name"><input className={inp} value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Full name" /></Field>
            <Field label="Email"><input className={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" /></Field>
            <Field label="Phone"><input className={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0300-0000000" /></Field>
            <Field label="Primary Service"><select className={sel} value={form.primary_service} onChange={e => set('primary_service', e.target.value)}><option value="">Select…</option>{SERVICES.map(s => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Secondary Service"><select className={sel} value={form.secondary_service} onChange={e => set('secondary_service', e.target.value)}><option value="">Select…</option>{SERVICES.map(s => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Est. Package Value (PKR)"><input className={inp} type="number" value={form.package_value} onChange={e => set('package_value', e.target.value)} placeholder="e.g. 75000" /></Field>

            <div className="col-span-2 border-t border-gray-100 pt-4 mt-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Audit Scores (1–10)</p>
              <div className="grid grid-cols-4 gap-3">
                {['website_score', 'social_score', 'branding_score', 'video_score'].map(f => (
                  <div key={f}>
                    <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{f.replace('_score', '').replace('_', ' ')}</label>
                    <input className={inp} type="number" min="1" max="10" value={form[f]} onChange={e => set(f, e.target.value)} placeholder="1–10" />
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2 border-t border-gray-100 pt-4 mt-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Outreach Details</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Outreach Channel"><select className={sel} value={form.outreach_channel} onChange={e => set('outreach_channel', e.target.value)}><option value="">Select…</option>{CHANNELS.map(c => <option key={c}>{c}</option>)}</select></Field>
                <Field label="Date Contacted"><input className={inp} type="date" value={form.date_contacted} onChange={e => set('date_contacted', e.target.value)} /></Field>
                <Field label="Deal Status"><select className={sel} value={form.deal_status} onChange={e => set('deal_status', e.target.value)}>{DEAL_STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field>
                <Field label="Follow-Up Date"><input className={inp} type="date" value={form.followup_date} onChange={e => set('followup_date', e.target.value)} /></Field>
                <Field label="Follow-Up Method"><select className={sel} value={form.followup_method} onChange={e => set('followup_method', e.target.value)}><option value="">Select…</option>{FOLLOW_METHODS.map(m => <option key={m}>{m}</option>)}</select></Field>
                <div className="grid grid-cols-3 gap-2">
                  {[['response_received', 'Response'], ['meeting_scheduled', 'Meeting'], ['proposal_sent', 'Proposal']].map(([k, l]) => (
                    <div key={k}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{l} Sent?</label>
                      <select className={sel} value={form[k]} onChange={e => set(k, e.target.value)}>
                        <option value="No">No</option><option value="Yes">Yes</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Field label="Notes" full>
              <textarea className={inp} rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional context…" />
            </Field>
          </div>
        </form>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-60"
            style={{ backgroundColor: '#3A86FF' }}
          >
            {saving ? 'Adding…' : 'Add Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LeadTracker() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCell, setEditingCell] = useState({ id: null, field: null });
  const [editValue, setEditValue] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterChannel, setFilterChannel] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterLowScore, setFilterLowScore] = useState(false);
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];

  const load = () => {
    setLoading(true);
    api.getLeads()
      .then(data => { setLeads(data); setLoading(false); })
      .catch(e => { toast.error(e.message); setLoading(false); });
  };

  useEffect(load, []);

  useEffect(() => {
    if (editingCell.id && inputRef.current) inputRef.current.focus();
  }, [editingCell]);

  const startEdit = (id, field, value) => {
    setEditingCell({ id, field });
    setEditValue(value ?? '');
  };

  const saveEdit = async () => {
    const { id, field } = editingCell;
    if (!id) return;
    setEditingCell({ id: null, field: null });
    try {
      const updated = await api.updateLead(id, { [field]: editValue });
      setLeads(prev => prev.map(l => l.id === id ? updated : l));
      toast.success('Saved', { duration: 1500, icon: '✓' });
    } catch (err) {
      toast.error(err.message);
      load();
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteLead(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      toast.success('Lead deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirmDelete(null);
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = leads
    .filter(l => {
      if (filterStatus && l.deal_status !== filterStatus) return false;
      if (filterChannel && l.outreach_channel !== filterChannel) return false;
      if (filterIndustry && l.industry !== filterIndustry) return false;
      if (filterLowScore && !([l.website_score, l.social_score, l.branding_score, l.video_score].some(s => s > 0 && s < 5))) return false;
      if (search) {
        const q = search.toLowerCase();
        return (l.business_name || '').toLowerCase().includes(q)
          || (l.contact_name || '').toLowerCase().includes(q)
          || (l.email || '').toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (av == null) av = '';
      if (bv == null) bv = '';
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={12} className="opacity-20" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-accent" /> : <ChevronDown size={12} className="text-accent" />;
  };

  const Th = ({ label, field, className = '' }) => (
    <th
      className={`px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:text-gray-800 transition-colors ${className}`}
      onClick={() => toggleSort(field)}
    >
      <div className="flex items-center gap-1">{label}<SortIcon field={field} /></div>
    </th>
  );

  const Cell = ({ lead, field, type = 'text', options, className = '' }) => {
    const isEditing = editingCell.id === lead.id && editingCell.field === field;
    const val = lead[field];

    if (isEditing) {
      if (type === 'select') {
        return (
          <td className="px-2 py-1">
            <select
              ref={inputRef}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={saveEdit}
              className="w-full text-xs border border-accent rounded px-1.5 py-1 outline-none bg-white"
            >
              {(options || []).map(o => <option key={o}>{o}</option>)}
            </select>
          </td>
        );
      }
      return (
        <td className="px-2 py-1">
          <input
            ref={inputRef}
            type={type}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={e => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') setEditingCell({ id: null, field: null });
            }}
            className="w-full text-xs border border-accent rounded px-1.5 py-1 outline-none bg-blue-50"
            style={{ minWidth: 80 }}
          />
        </td>
      );
    }

    return (
      <td
        className={`px-3 py-2.5 text-xs text-gray-700 cursor-pointer hover:bg-blue-50/60 transition-colors ${className}`}
        onClick={() => startEdit(lead.id, field, val)}
        title="Click to edit"
      >
        {val ?? <span className="text-gray-300">—</span>}
      </td>
    );
  };

  const rowBg = (lead) => {
    if (!lead.followup_date || ['Closed Won', 'Closed Lost'].includes(lead.deal_status)) return '';
    if (lead.followup_date < today) return 'bg-red-50';
    if (lead.followup_date === today) return 'bg-orange-50';
    return '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lead Tracker</h1>
            <p className="text-sm text-gray-400 mt-0.5">{filtered.length} of {leads.length} leads</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#3A86FF' }}
          >
            <Plus size={16} /> Add Lead
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              placeholder="Search business, contact, email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>}
          </div>

          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white text-gray-600"
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {DEAL_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>

          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white text-gray-600"
            value={filterChannel} onChange={e => setFilterChannel(e.target.value)}
          >
            <option value="">All Channels</option>
            {CHANNELS.map(c => <option key={c}>{c}</option>)}
          </select>

          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white text-gray-600"
            value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}
          >
            <option value="">All Industries</option>
            {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              className="accent-accent w-4 h-4 rounded"
              checked={filterLowScore}
              onChange={e => setFilterLowScore(e.target.checked)}
            />
            <Filter size={14} /> Audit Opps (score &lt; 5)
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Users size={48} className="mb-3 text-gray-200" />
            <p className="font-medium">No leads found</p>
            <p className="text-sm mt-1">Try adjusting filters or add a new lead.</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 w-10">#</th>
                <Th label="Business" field="business_name" />
                <Th label="Industry" field="industry" />
                <Th label="Web" field="website_score" className="w-14" />
                <Th label="Soc" field="social_score" className="w-12" />
                <Th label="Brand" field="branding_score" className="w-14" />
                <Th label="Video" field="video_score" className="w-14" />
                <Th label="Contact" field="contact_name" />
                <Th label="Email" field="email" />
                <Th label="Phone" field="phone" />
                <Th label="Primary Service" field="primary_service" />
                <Th label="Value (PKR)" field="package_value" />
                <Th label="Channel" field="outreach_channel" />
                <Th label="Date" field="date_contacted" />
                <Th label="Status" field="deal_status" />
                <Th label="Follow-Up" field="followup_date" />
                <Th label="Notes" field="notes" />
                <th className="px-3 py-3 text-xs font-semibold text-gray-500 w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filtered.map((lead, idx) => (
                <tr key={lead.id} className={`group hover:bg-blue-50/30 transition-colors ${rowBg(lead)}`}>
                  <td className="px-3 py-2.5 text-xs text-gray-400 font-mono">{idx + 1}</td>
                  <Cell lead={lead} field="business_name" className="font-semibold text-gray-800 min-w-[140px]" />
                  <Cell lead={lead} field="industry" type="select" options={INDUSTRIES} />
                  <td className={`px-3 py-2.5 text-xs text-center ${SCORE_COLOR(lead.website_score)}`} onClick={() => startEdit(lead.id, 'website_score', lead.website_score)} style={{ cursor: 'pointer' }}>{lead.website_score || '—'}</td>
                  <td className={`px-3 py-2.5 text-xs text-center ${SCORE_COLOR(lead.social_score)}`} onClick={() => startEdit(lead.id, 'social_score', lead.social_score)} style={{ cursor: 'pointer' }}>{lead.social_score || '—'}</td>
                  <td className={`px-3 py-2.5 text-xs text-center ${SCORE_COLOR(lead.branding_score)}`} onClick={() => startEdit(lead.id, 'branding_score', lead.branding_score)} style={{ cursor: 'pointer' }}>{lead.branding_score || '—'}</td>
                  <td className={`px-3 py-2.5 text-xs text-center ${SCORE_COLOR(lead.video_score)}`} onClick={() => startEdit(lead.id, 'video_score', lead.video_score)} style={{ cursor: 'pointer' }}>{lead.video_score || '—'}</td>
                  <Cell lead={lead} field="contact_name" />
                  <Cell lead={lead} field="email" type="email" className="text-blue-600" />
                  <Cell lead={lead} field="phone" className="text-blue-600" />
                  <Cell lead={lead} field="primary_service" type="select" options={SERVICES} />
                  <Cell lead={lead} field="package_value" type="number" className="text-right font-medium" />
                  <Cell lead={lead} field="outreach_channel" type="select" options={CHANNELS} />
                  <Cell lead={lead} field="date_contacted" type="date" />
                  <td className="px-2 py-2.5 whitespace-nowrap" onClick={() => startEdit(lead.id, 'deal_status', lead.deal_status)} style={{ cursor: 'pointer' }}>
                    {editingCell.id === lead.id && editingCell.field === 'deal_status' ? (
                      <select ref={inputRef} value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={saveEdit} className="text-xs border border-accent rounded px-1 py-1 outline-none bg-white">
                        {DEAL_STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap ${STATUS_STYLES[lead.deal_status] || 'bg-gray-100 text-gray-600'}`}>
                        {lead.deal_status || 'Prospecting'}
                      </span>
                    )}
                  </td>
                  <td className={`px-3 py-2.5 text-xs whitespace-nowrap ${!lead.followup_date ? '' : lead.followup_date < today && !['Closed Won', 'Closed Lost'].includes(lead.deal_status) ? 'text-red-600 font-semibold' : lead.followup_date === today && !['Closed Won', 'Closed Lost'].includes(lead.deal_status) ? 'text-orange-600 font-semibold' : 'text-gray-600'}`} onClick={() => startEdit(lead.id, 'followup_date', lead.followup_date)} style={{ cursor: 'pointer' }}>
                    {editingCell.id === lead.id && editingCell.field === 'followup_date' ? (
                      <input ref={inputRef} type="date" value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={saveEdit} className="text-xs border border-accent rounded px-1.5 py-1 outline-none" />
                    ) : lead.followup_date || <span className="text-gray-300">—</span>}
                  </td>
                  <Cell lead={lead} field="notes" className="max-w-[200px] truncate" />
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/audit/${lead.id}`)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-purple-500 hover:bg-purple-50 transition-colors"
                        title="Open Audit"
                      >
                        <ClipboardCheck size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(lead)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                        title="Delete Lead"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Lead Modal */}
      {showModal && (
        <AddLeadModal
          onClose={() => setShowModal(false)}
          onCreated={lead => setLeads(prev => [lead, ...prev])}
        />
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Lead?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete <strong>{confirmDelete.business_name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete.id)} className="flex-1 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
