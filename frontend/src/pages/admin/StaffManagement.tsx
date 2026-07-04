import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getStaffList } from '../../api/adminApi';
import { getInvites, createInvite, deleteInvite, InviteToken } from '../../api/inviteApi';
import { User } from '../../types/user';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function isExpired(dateStr: string) {
  return new Date(dateStr) < new Date();
}

export default function StaffManagement() {
  // ── State ────────────────────────────────────────────────────────────────────
  const [staff, setStaff] = useState<User[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);

  const [invites, setInvites] = useState<InviteToken[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(true);

  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Fetchers ─────────────────────────────────────────────────────────────────
  const fetchStaff = useCallback(async () => {
    setStaffLoading(true);
    try {
      const data = await getStaffList();
      setStaff(data);
    } catch {
      toast.error('Failed to load staff list');
    } finally {
      setStaffLoading(false);
    }
  }, []);

  const fetchInvites = useCallback(async () => {
    setInvitesLoading(true);
    try {
      const data = await getInvites();
      setInvites(data);
    } catch {
      toast.error('Failed to load invites');
    } finally {
      setInvitesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchInvites();
  }, [fetchStaff, fetchInvites]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) {
      toast.error('Please fill in both name and email');
      return;
    }
    setInviteLoading(true);
    setGeneratedLink(null);
    try {
      const { link } = await createInvite(inviteEmail.trim(), inviteName.trim());
      setGeneratedLink(link);
      setInviteName('');
      setInviteEmail('');
      toast.success('Invite link generated!');
      fetchInvites();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to generate invite';
      toast.error(msg);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeleteInvite = async (id: string) => {
    try {
      await deleteInvite(id);
      setInvites((prev) => prev.filter((inv) => inv.id !== id));
      toast.success('Invite deleted');
    } catch {
      toast.error('Failed to delete invite');
    }
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-8">

        {/* Page Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage staff accounts and send invite links to onboard new staff members.
          </p>
        </div>

        {/* ── Section 1: Current Staff ────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Current Staff
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {staffLoading ? (
              <div className="p-6 flex justify-center"><Loader /></div>
            ) : staff.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                No staff members yet. Invite them below.
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Joined Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                          {member.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{member.email}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {(member as User & { createdAt?: string }).createdAt
                          ? formatDate((member as User & { createdAt?: string }).createdAt!)
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400 italic">—</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </section>

        {/* ── Section 2: Pending Invites ──────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Pending Invites
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {invitesLoading ? (
              <div className="p-6 flex justify-center"><Loader /></div>
            ) : invites.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                No invites created yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Created</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Expires</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invites.map((invite) => {
                    const used = !!invite.usedAt;
                    const expired = !used && isExpired(invite.expiresAt);
                    const statusLabel = used ? 'Used' : expired ? 'Expired' : 'Pending';
                    const statusClass = used
                      ? 'bg-green-100 text-green-700'
                      : expired
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700';

                    return (
                      <tr key={invite.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-800">{invite.email}</td>
                        <td className="px-4 py-3 text-gray-600">{invite.name}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(invite.createdAt)}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(invite.expiresAt)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteInvite(invite.id)}
                            className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors hover:underline"
                            id={`delete-invite-${invite.id}`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </section>

        {/* ── Section 3: Invite New Staff ─────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Invite New Staff
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
            <form onSubmit={handleGenerateInvite} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Staff Name"
                  placeholder="Jane Smith"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  required
                  id="invite-name"
                />
                <Input
                  label="Staff Email"
                  type="email"
                  placeholder="jane@campus.edu"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  id="invite-email"
                />
              </div>
              <Button
                type="submit"
                loading={inviteLoading}
                id="generate-invite-btn"
              >
                🔗 Generate Invite Link
              </Button>
            </form>

            {/* Generated link result */}
            {generatedLink && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl space-y-3 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-semibold text-sm">✅ Invite link generated!</span>
                  <span className="text-xs text-green-500">Share this with the staff member.</span>
                </div>
                <div className="flex items-center gap-2 bg-white border border-green-200 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-700 truncate flex-1 font-mono">{generatedLink}</span>
                  <button
                    onClick={handleCopy}
                    id="copy-invite-link-btn"
                    className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors px-2 py-1 rounded hover:bg-indigo-50"
                  >
                    {copied ? '✓ Copied!' : 'Copy Link'}
                  </button>
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span>⏱</span>
                  This link expires in 24 hours.
                </p>
              </div>
            )}
          </div>
        </section>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  );
}
