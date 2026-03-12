import { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, Trash2, UserPlus, Mail, Shield, Crown, Loader2,
  Share2, Database, Activity, ChevronRight, Copy, Check, AlertCircle,
} from 'lucide-react';

const API_URL = 'https://snapleads-api.onrender.com';

interface TeamMember {
  user_id: string;
  email: string;
  name: string;
  role: string;
  joined_at: string;
}

interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  member_count: number;
  shared_leads_count: number;
  members?: TeamMember[];
}

interface ActivityItem {
  id: string;
  user_id: string;
  action: string;
  detail: string;
  created_at: string;
}

interface SharedLead {
  id: string;
  shared_by: string;
  email: string;
  phone: string;
  name: string;
  platform: string;
  source_keyword: string;
  quality_score: number;
  created_at: string;
}

function getToken(): string | null {
  const saved = localStorage.getItem('snapleads_account');
  if (!saved) return null;
  try {
    return JSON.parse(saved).token;
  } catch {
    return null;
  }
}

function getUserId(): string | null {
  const saved = localStorage.getItem('snapleads_account');
  if (!saved) return null;
  try {
    return JSON.parse(saved).user?.id ?? null;
  } catch {
    return null;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data as T;
}

export default function TeamDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [sharedLeads, setSharedLeads] = useState<SharedLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const token = getToken();
  const userId = getUserId();

  const loadTeams = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiFetch<{ teams: Team[] }>('/api/teams/my');
      setTeams(data.teams);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const loadTeamDetails = async (teamId: string) => {
    try {
      const [teamData, activityData, leadsData] = await Promise.all([
        apiFetch<{ team: Team & { members: TeamMember[] } }>(`/api/teams/${teamId}`),
        apiFetch<{ activities: ActivityItem[] }>(`/api/teams/${teamId}/activity`),
        apiFetch<{ leads: SharedLead[]; total: number }>(`/api/teams/${teamId}/leads?limit=50`),
      ]);
      setSelectedTeam({ ...teamData.team, members: teamData.team.members });
      setActivity(activityData.activities);
      setSharedLeads(leadsData.leads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team details');
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await apiFetch('/api/teams', {
        method: 'POST',
        body: JSON.stringify({ name: newTeamName.trim() }),
      });
      setNewTeamName('');
      setShowCreate(false);
      await loadTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !selectedTeam) return;
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/api/teams/${selectedTeam.id}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      setInviteEmail('');
      setShowInvite(false);
      await loadTeamDetails(selectedTeam.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Delete this team? All shared leads and activity will be removed.')) return;
    setLoading(true);
    try {
      await apiFetch(`/api/teams/${teamId}`, { method: 'DELETE' });
      setSelectedTeam(null);
      await loadTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedTeam || !confirm('Remove this member from the team?')) return;
    setLoading(true);
    try {
      await apiFetch(`/api/teams/${selectedTeam.id}/members/${memberId}`, { method: 'DELETE' });
      await loadTeamDetails(selectedTeam.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const copyLeadEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Not authenticated
  if (!token) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-lg mx-auto text-center py-20">
          <Users className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Team Collaboration</h2>
          <p className="text-sm text-text-secondary mb-6">
            Sign in from the Account page to create teams, invite members, and share leads.
          </p>
        </div>
      </div>
    );
  }

  // Team detail view
  if (selectedTeam) {
    const isOwner = selectedTeam.owner_id === userId;
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedTeam(null)}
              className="text-text-muted hover:text-text-primary transition-colors text-sm"
            >
              Teams
            </button>
            <ChevronRight className="w-4 h-4 text-text-muted" />
            <h1 className="text-2xl font-bold text-text-primary">{selectedTeam.name}</h1>
            {isOwner && (
              <button
                onClick={() => handleDeleteTeam(selectedTeam.id)}
                className="ml-auto px-3 py-1.5 text-xs font-medium text-error/70 hover:text-error border border-error/20 hover:border-error/40 rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5 inline mr-1" />Delete Team
              </button>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-sm text-error flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Members */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />Members ({selectedTeam.members?.length ?? 0}/10)
              </h3>
              {isOwner && (
                <button
                  onClick={() => setShowInvite(!showInvite)}
                  className="px-3 py-1.5 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5 inline mr-1" />Invite
                </button>
              )}
            </div>

            {showInvite && (
              <div className="flex gap-2 p-3 bg-zinc-800/40 rounded-xl">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                  placeholder="member@example.com"
                  className="flex-1 px-3 py-2 bg-bg-input border border-[#3f3f46] rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent"
                />
                <button
                  onClick={handleInvite}
                  disabled={loading}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-white text-sm font-medium rounded-lg transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                </button>
              </div>
            )}

            <div className="divide-y divide-[#3f3f46]">
              {selectedTeam.members?.map((member) => (
                <div key={member.user_id} className="flex items-center gap-3 py-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    {member.role === 'owner' ? (
                      <Crown className="w-4 h-4 text-amber-400" />
                    ) : member.role === 'admin' ? (
                      <Shield className="w-4 h-4 text-accent" />
                    ) : (
                      <Users className="w-4 h-4 text-text-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{member.name}</p>
                    <p className="text-xs text-text-muted truncate">{member.email}</p>
                  </div>
                  <span className="text-xs font-medium text-text-muted capitalize px-2 py-1 bg-zinc-800/60 rounded-md">
                    {member.role}
                  </span>
                  {isOwner && member.user_id !== userId && (
                    <button
                      onClick={() => handleRemoveMember(member.user_id)}
                      className="text-text-muted hover:text-error transition-colors p-1"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Shared Leads */}
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Share2 className="w-5 h-5 text-accent" />Shared Leads ({sharedLeads.length})
            </h3>
            {sharedLeads.length === 0 ? (
              <p className="text-sm text-text-muted py-4 text-center">
                No leads shared yet. Use the extraction results to share leads with your team.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-text-muted uppercase tracking-wider border-b border-[#3f3f46]">
                      <th className="pb-3 pr-4">Name</th>
                      <th className="pb-3 pr-4">Email</th>
                      <th className="pb-3 pr-4">Platform</th>
                      <th className="pb-3 pr-4">Score</th>
                      <th className="pb-3">Shared</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3f3f46]/50">
                    {sharedLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-zinc-800/20">
                        <td className="py-2.5 pr-4 text-text-primary">{lead.name || '—'}</td>
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-text-secondary truncate max-w-[200px]">{lead.email || '—'}</span>
                            {lead.email && (
                              <button
                                onClick={() => copyLeadEmail(lead.email, lead.id)}
                                className="text-text-muted hover:text-accent transition-colors"
                              >
                                {copiedId === lead.id ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 text-text-muted capitalize">{lead.platform || '—'}</td>
                        <td className="py-2.5 pr-4">
                          <span className={`text-xs font-semibold ${lead.quality_score >= 70 ? 'text-success' : lead.quality_score >= 40 ? 'text-amber-400' : 'text-text-muted'}`}>
                            {lead.quality_score}
                          </span>
                        </td>
                        <td className="py-2.5 text-text-muted text-xs">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />Recent Activity
            </h3>
            {activity.length === 0 ? (
              <p className="text-sm text-text-muted py-4 text-center">No activity yet.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 py-2">
                    <div className="w-2 h-2 rounded-full bg-accent/60 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary">
                        <span className="font-medium">{item.action}</span>
                        {item.detail && <span className="text-text-secondary"> — {item.detail}</span>}
                      </p>
                      <p className="text-xs text-text-muted">{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Team list view
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Teams</h1>
            <p className="text-sm text-text-secondary mt-1">Collaborate with your team and share leads</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-accent/25 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />New Team
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-sm text-error flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {showCreate && (
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Create Team</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTeam()}
                placeholder="Team name"
                className="flex-1 px-4 py-2.5 bg-bg-input border border-[#3f3f46] rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 outline-none focus:border-accent"
              />
              <button
                onClick={handleCreateTeam}
                disabled={loading || !newTeamName.trim()}
                className="px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-white text-sm font-medium rounded-xl transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
              </button>
            </div>
          </div>
        )}

        {loading && teams.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : teams.length === 0 ? (
          <div className="card p-12 text-center">
            <Users className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No teams yet</h3>
            <p className="text-sm text-text-secondary mb-6">Create a team to start collaborating and sharing leads with your colleagues.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => loadTeamDetails(team.id)}
                className="card p-6 text-left hover:border-accent/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/15 transition-colors">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-text-primary group-hover:text-accent transition-colors">{team.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{team.member_count} members</span>
                      <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5" />{team.shared_leads_count} leads</span>
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{new Date(team.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
