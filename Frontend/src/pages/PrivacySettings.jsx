import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const VIS_OPTIONS = [
  { value: 'public', label: 'Public — anyone can see profile basics' },
  { value: 'friends_only', label: 'Friends only' },
  { value: 'private', label: 'Private — minimal visibility' },
];

export default function PrivacySettings() {
  const { user, updateLocalUser } = useAuth();
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [showEmail, setShowEmail] = useState(false);
  const [showBio, setShowBio] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const ps = user?.privacySettings;
    if (ps) {
      if (ps.profileVisibility) setProfileVisibility(ps.profileVisibility);
      if (typeof ps.showEmail === 'boolean') setShowEmail(ps.showEmail);
      if (typeof ps.showBio === 'boolean') setShowBio(ps.showBio);
    }
  }, [user]);

  async function handleSave(ev) {
    ev.preventDefault();
    const id = user?._id;
    if (!id) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/users/${id}`, {
        privacySettings: {
          profileVisibility,
          showEmail,
          showBio,
        },
      });
      if (data.success && data.data?.user) {
        updateLocalUser(data.data.user);
        toast.success(data.message || 'Privacy settings saved');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Privacy</h1>
        <p className="text-slate-600">Control what others can see</p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Profile visibility</label>
          <select
            value={profileVisibility}
            onChange={(e) => setProfileVisibility(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
          >
            {VIS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={showEmail}
              onChange={(e) => setShowEmail(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-800">Show email on my profile</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={showBio}
              onChange={(e) => setShowBio(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-800">Show bio on my profile</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save privacy settings'}
        </button>
      </form>
    </div>
  );
}
