import { useState, useEffect } from 'react';
import { Users, Phone, TrendingUp, Calendar, FileText, CheckCircle, Activity, RefreshCw } from 'lucide-react';
import { api } from '../api';

const STATUS_COLORS = {
  Prospecting: '#6B7280',
  Contacted: '#3A86FF',
  Interested: '#10B981',
  'Meeting Set': '#8B5CF6',
  'Proposal Sent': '#F59E0B',
  'Closed Won': '#059669',
  'Closed Lost': '#EF4444',
};

function KPICard({ title, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#6B7280';
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {status}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 h-28 border border-gray-100">
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.getDashboard()
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(load, []);

  if (loading) return <div className="p-8"><Skeleton /></div>;

  if (error) return (
    <div className="p-8 flex flex-col items-center justify-center h-64">
      <p className="text-red-500 mb-3">{error}</p>
      <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm">
        <RefreshCw size={16} /> Retry
      </button>
    </div>
  );

  const { kpis, pipeline, recentActivity, stats } = data;
  const maxCount = Math.max(...pipeline.map(p => p.count), 1);

  return (
    <div className="p-8 max-w-screen-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Your lead pipeline at a glance</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <KPICard title="Total Leads" value={kpis.total} icon={Users} color="#3A86FF" sub="All tracked" />
        <KPICard title="Contacted" value={kpis.contacted} icon={Phone} color="#6366F1" sub="Outreach sent" />
        <KPICard title="Interested" value={kpis.interested} icon={TrendingUp} color="#10B981" sub="Responded positively" />
        <KPICard title="Meetings Booked" value={kpis.meetings} icon={Calendar} color="#8B5CF6" sub="Calls scheduled" />
        <KPICard title="Proposals Sent" value={kpis.proposals} icon={FileText} color="#F59E0B" sub="Awaiting decision" />
        <KPICard title="Closed Won" value={kpis.closedWon} icon={CheckCircle} color="#059669" sub="Signed clients" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Pipeline Funnel */}
        <div className="xl:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Pipeline Funnel</h2>
          <div className="space-y-3">
            {pipeline.map(({ stage, count }) => (
              <div key={stage} className="flex items-center gap-3">
                <span className="w-28 text-xs text-gray-500 text-right shrink-0 font-medium">{stage}</span>
                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                    style={{
                      width: count === 0 ? '4px' : `${Math.max((count / maxCount) * 100, 8)}%`,
                      backgroundColor: STATUS_COLORS[stage] || '#3A86FF',
                      minWidth: count > 0 ? '2rem' : '4px',
                    }}
                  >
                    {count > 0 && <span className="text-white text-xs font-bold">{count}</span>}
                  </div>
                </div>
                <span className="w-8 text-sm font-semibold text-gray-700 shrink-0 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Quick Stats</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#f0fdf4' }}>
              <p className="text-sm font-semibold" style={{ color: '#16a34a' }}>Conversion Rate</p>
              <p className="text-4xl font-extrabold mt-1" style={{ color: '#15803d' }}>{stats.conversionRate}%</p>
              <p className="text-xs mt-1.5" style={{ color: '#4ade80' }}>Closed Won ÷ Total Leads</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#eff6ff' }}>
              <p className="text-sm font-semibold" style={{ color: '#2563eb' }}>Response Rate</p>
              <p className="text-4xl font-extrabold mt-1" style={{ color: '#1d4ed8' }}>{stats.responseRate}%</p>
              <p className="text-xs mt-1.5" style={{ color: '#93c5fd' }}>Interested ÷ Contacted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <Activity className="w-5 h-5" style={{ color: '#3A86FF' }} />
          <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          <span className="ml-auto text-xs text-gray-400">Last 10 updated leads</span>
        </div>
        {recentActivity.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No leads yet</p>
            <p className="text-gray-300 text-sm mt-1">Add your first lead in the Lead Tracker to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentActivity.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: `${STATUS_COLORS[lead.deal_status] || '#3A86FF'}` }}
                  >
                    {(lead.business_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{lead.business_name}</p>
                    <p className="text-xs text-gray-400">
                      {lead.contact_name && `${lead.contact_name} · `}{lead.industry}
                      {lead.primary_service && ` · ${lead.primary_service}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {lead.package_value > 0 && (
                    <span className="text-xs text-gray-500 hidden sm:block">
                      PKR {Number(lead.package_value).toLocaleString()}
                    </span>
                  )}
                  <StatusBadge status={lead.deal_status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
