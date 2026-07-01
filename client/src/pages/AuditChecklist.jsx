import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';

const AUDIT_SECTIONS = [
  {
    key: 'website_score',
    label: 'Website Audit',
    icon: '🌐',
    items: [
      'Mobile-responsive & loads fast on all devices',
      'Clear headline communicating what they do',
      'Strong call-to-action (CTA) visible above the fold',
      'Professional, modern design (not dated)',
      'Contact info easy to find',
      'SEO basics: meta titles, headings, alt text',
      'Trust signals: testimonials, logos, reviews',
      'Secure (HTTPS) and no broken links',
    ],
  },
  {
    key: 'social_score',
    label: 'Social Media Audit',
    icon: '📱',
    items: [
      'Profile bio complete and professional',
      'Consistent posting schedule (3+ times/week)',
      'High-quality images and graphics',
      'Engagement rate vs. follower count',
      'Brand voice consistent across posts',
      'Using Stories/Reels for reach',
      'Hashtag strategy in place',
      'Responds to comments and DMs promptly',
    ],
  },
  {
    key: 'branding_score',
    label: 'Branding Audit',
    icon: '🎨',
    items: [
      'Logo is professional and high resolution',
      'Consistent color palette across all assets',
      'Typography consistent and readable',
      'Brand messaging clear and differentiated',
      'Business cards / print materials look professional',
      'Consistent brand identity across digital + physical',
    ],
  },
  {
    key: 'video_score',
    label: 'Video Content Audit',
    icon: '🎬',
    items: [
      'Video quality is HD (1080p minimum)',
      'Clear, professional audio — no background noise',
      'Compelling storytelling and narrative',
      'Call-to-action visible in videos',
      'Consistent visual style and branding in videos',
      'Uses captions/subtitles for accessibility',
    ],
  },
];

const scoreColor = (n) => {
  if (!n) return { bg: 'bg-gray-100', text: 'text-gray-400', bar: '#E5E7EB', label: 'No Score' };
  if (n >= 8) return { bg: 'bg-green-50', text: 'text-green-700', bar: '#10B981', label: 'Strong' };
  if (n >= 5) return { bg: 'bg-yellow-50', text: 'text-yellow-700', bar: '#F59E0B', label: 'Average' };
  return { bg: 'bg-red-50', text: 'text-red-700', bar: '#EF4444', label: 'Needs Work' };
};

function ScoreBar({ value }) {
  const { bar } = scoreColor(value);
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: value ? `${value * 10}%` : '0%', backgroundColor: bar }}
      />
    </div>
  );
}

export default function AuditChecklist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [scores, setScores] = useState({ website_score: '', social_score: '', branding_score: '', video_score: '' });
  const [notes, setNotes] = useState({ website_score: '', social_score: '', branding_score: '', video_score: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getLead(id)
      .then(l => {
        setLead(l);
        setScores({
          website_score: l.website_score || '',
          social_score: l.social_score || '',
          branding_score: l.branding_score || '',
          video_score: l.video_score || '',
        });
        setLoading(false);
      })
      .catch(e => {
        toast.error(e.message);
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {};
      for (const [k, v] of Object.entries(scores)) {
        payload[k] = v !== '' ? Number(v) : null;
      }
      const auditNote = AUDIT_SECTIONS.map(s =>
        notes[s.key] ? `[${s.label}] ${notes[s.key]}` : ''
      ).filter(Boolean).join('\n');

      if (auditNote) payload.notes = auditNote;

      await api.updateLead(id, payload);
      setLead(prev => ({ ...prev, ...payload }));
      toast.success('Audit scores saved!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!lead) return (
    <div className="p-8 flex flex-col items-center gap-3 text-gray-400">
      <AlertCircle size={40} />
      <p>Lead not found.</p>
      <button onClick={() => navigate('/leads')} className="text-accent text-sm hover:underline">← Back to Lead Tracker</button>
    </div>
  );

  const avgAll = (() => {
    const vals = [scores.website_score, scores.social_score, scores.branding_score, scores.video_score]
      .map(Number).filter(n => n > 0);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
  })();

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/leads')}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{lead.business_name}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {lead.industry && `${lead.industry} · `}
            {lead.contact_name && `${lead.contact_name} · `}
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                scoreColor(avgAll)?.text
              } ${scoreColor(avgAll)?.bg}`}
            >
              Overall: {avgAll || 'No scores yet'}
            </span>
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#3A86FF' }}
        >
          <Save size={16} /> {saving ? 'Saving…' : 'Save Scores'}
        </button>
      </div>

      {/* Score Summary Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {AUDIT_SECTIONS.map(s => {
          const v = scores[s.key];
          const { bg, text, label } = scoreColor(Number(v));
          return (
            <div key={s.key} className={`rounded-xl p-4 ${bg}`}>
              <p className="text-lg mb-1">{s.icon}</p>
              <p className="text-xs font-semibold text-gray-600">{s.label.replace(' Audit', '')}</p>
              <p className={`text-3xl font-extrabold mt-1 ${text}`}>{v || '—'}<span className="text-base font-normal">{v ? '/10' : ''}</span></p>
              <p className={`text-xs mt-0.5 ${text}`}>{label}</p>
              <ScoreBar value={Number(v)} />
            </div>
          );
        })}
      </div>

      {/* Audit Sections */}
      <div className="space-y-6">
        {AUDIT_SECTIONS.map(section => {
          const v = scores[section.key];
          const { bg, text, bar } = scoreColor(Number(v));
          return (
            <div key={section.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 ${bg}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <h2 className="text-base font-bold text-gray-900">{section.label}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: v ? `${v * 10}%` : 0, backgroundColor: bar }} />
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={v}
                      onChange={e => {
                        const n = Math.min(10, Math.max(1, Number(e.target.value)));
                        setScores(p => ({ ...p, [section.key]: e.target.value === '' ? '' : n }));
                      }}
                      className={`w-16 text-center text-lg font-bold border-2 rounded-lg px-2 py-1 outline-none focus:border-accent transition-colors ${text} ${bg} border-current/20`}
                      placeholder="—"
                    />
                    <span className="text-sm text-gray-400">/10</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Checklist</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {section.items.map((item, i) => (
                    <label key={i} className="flex items-start gap-2.5 text-sm text-gray-600 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="mt-0.5 accent-accent w-4 h-4 rounded shrink-0"
                      />
                      <span className="group-hover:text-gray-900 transition-colors leading-snug">{item}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Audit Notes</label>
                  <textarea
                    rows={2}
                    value={notes[section.key]}
                    onChange={e => setNotes(p => ({ ...p, [section.key]: e.target.value }))}
                    placeholder={`Specific observations for ${section.label}…`}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent resize-none"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl shadow-md hover:opacity-90 transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#3A86FF' }}
        >
          <Save size={16} /> {saving ? 'Saving…' : 'Save Audit Scores'}
        </button>
      </div>
    </div>
  );
}
