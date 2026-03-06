import { useState, useEffect } from 'react';
import { Clock, Plus, Pause, Play, Trash2, Loader2, Calendar } from 'lucide-react';
import { fetchSchedules, createSchedule, pauseSchedule, resumeSchedule, deleteSchedule } from '@/lib/api';
import type { ScheduleItem } from '@/lib/api';

export default function ScheduledExtractions() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '', keywords: '', platforms: 'reddit,linkedin',
    frequency: 'daily', cron_expression: '',
    pages_per_keyword: 3, delay_between_requests: 3,
    use_google_dorking: true, auto_verify: true,
  });

  useEffect(() => { loadSchedules(); }, []);

  const loadSchedules = async () => {
    try { setSchedules(await fetchSchedules()); } catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.name || !form.keywords) return;
    try {
      await createSchedule({
        name: form.name,
        keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        platforms: form.platforms.split(',').map(p => p.trim()).filter(Boolean),
        frequency: form.frequency,
        cron_expression: form.cron_expression,
        pages_per_keyword: form.pages_per_keyword,
        delay_between_requests: form.delay_between_requests,
        use_google_dorking: form.use_google_dorking,
        auto_verify: form.auto_verify,
      });
      setShowCreate(false);
      setForm({ name: '', keywords: '', platforms: 'reddit,linkedin', frequency: 'daily', cron_expression: '', pages_per_keyword: 3, delay_between_requests: 3, use_google_dorking: true, auto_verify: true });
      loadSchedules();
    } catch { /* ignore */ }
  };

  const handleToggle = async (id: string, status: string) => {
    try {
      if (status === 'active') await pauseSchedule(id);
      else await resumeSchedule(id);
      loadSchedules();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    try { await deleteSchedule(id); loadSchedules(); } catch { /* ignore */ }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[720px] mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              Scheduled Extractions
            </h2>
            <p className="text-sm text-text-muted mt-2">Automate recurring lead extractions</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> New Schedule
          </button>
        </div>

        {showCreate && (
          <div className="rounded-xl bg-bg-card border border-border p-6 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">Create Schedule</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">Schedule Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Weekly Lead Scrape" className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">Keywords (comma-separated)</label>
                <input type="text" value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} placeholder="web developer, react developer" className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">Platforms (comma-separated)</label>
                <input type="text" value={form.platforms} onChange={e => setForm({...form, platforms: e.target.value})} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">Frequency</label>
                  <select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40">
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom (Cron)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">Pages per Keyword</label>
                  <input type="number" value={form.pages_per_keyword} onChange={e => setForm({...form, pages_per_keyword: Number(e.target.value)})} min={1} max={20} className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40" />
                </div>
              </div>
              {form.frequency === 'custom' && (
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">Cron Expression</label>
                  <input type="text" value={form.cron_expression} onChange={e => setForm({...form, cron_expression: e.target.value})} placeholder="0 9 * * MON" className="w-full bg-bg-input border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40" />
                </div>
              )}
              <button onClick={handleCreate} className="w-full py-2.5 rounded-lg bg-accent hover:bg-accent/80 text-white text-sm font-semibold transition-colors">Create Schedule</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-accent animate-spin" /></div>
        ) : schedules.length === 0 ? (
          <div className="rounded-xl bg-bg-card border border-border p-12 text-center">
            <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-40" />
            <p className="text-sm text-text-muted">No scheduled extractions yet</p>
            <p className="text-xs text-text-muted mt-1">Click "New Schedule" to create one</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map(s => (
              <div key={s.id} className="rounded-xl bg-bg-card border border-border p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">{s.name}</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {s.status}
                      </span>
                      <span className="text-xs text-text-muted">{s.frequency}</span>
                      <span className="text-xs text-text-muted">{s.total_runs} runs</span>
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      Keywords: {s.keywords.join(', ')} | Platforms: {s.platforms.join(', ')}
                    </p>
                    {s.last_run && <p className="text-xs text-text-muted mt-0.5">Last run: {new Date(s.last_run).toLocaleString()}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggle(s.id, s.status)} className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors" title={s.status === 'active' ? 'Pause' : 'Resume'}>
                      {s.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
