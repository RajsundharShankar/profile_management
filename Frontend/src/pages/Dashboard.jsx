import { useAuth } from '../context/AuthContext';
import { publicAssetUrl } from '../utils/assets';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const avatar = publicAssetUrl(user?.profileImage);
  const ps = user?.privacySettings || {};

  if (loading && !user) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile dashboard</h1>
        <p className="text-slate-600">Your account overview</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-10">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-white/20 text-4xl font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className="text-center text-white sm:text-left">
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-brand-100">{user?.email}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 px-6 py-6">
          <div>
            <h3 className="text-sm font-medium text-slate-500">Bio</h3>
            <p className="mt-1 text-slate-800">{user?.bio || 'No bio yet. Edit your profile to add one.'}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="text-sm font-medium text-slate-500">Profile visibility</h3>
              <p className="mt-1 capitalize text-slate-900">{ps.profileVisibility || 'public'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="text-sm font-medium text-slate-500">Show email on profile</h3>
              <p className="mt-1 text-slate-900">{ps.showEmail ? 'Yes' : 'No'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="text-sm font-medium text-slate-500">Show bio</h3>
              <p className="mt-1 text-slate-900">{ps.showBio !== false ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
