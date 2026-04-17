import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { publicAssetUrl } from '../utils/assets';

export default function EditProfile() {
  const { user, fetchProfile, updateLocalUser } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
    }
  }, [user]);

  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function validate() {
    const e = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (bio.length > 500) e.bio = 'Bio max 500 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSaveProfile(ev) {
    ev.preventDefault();
    if (!validate()) return;
    const id = user?._id;
    if (!id) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/users/${id}`, { name: name.trim(), bio });
      if (data.success && data.data?.user) {
        updateLocalUser(data.data.user);
        toast.success(data.message || 'Profile saved');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadAvatar() {
    if (!file) {
      toast.error('Choose an image first');
      return;
    }
    const id = user?._id;
    if (!id) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('avatar', file);
      const { data } = await api.post('/users/upload-avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success && data.data?.user) {
        updateLocalUser(data.data.user);
        setFile(null);
        setPreview('');
        await fetchProfile();
        toast.success(data.message || 'Photo updated');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  const currentAvatar = publicAssetUrl(user?.profileImage);

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit profile</h1>
        <p className="text-slate-600">Update your name, bio, and profile photo</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Profile photo</h2>
        <p className="mt-1 text-sm text-slate-600">Preview before uploading</p>
        <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="relative">
            {(preview || currentAvatar) && (
              <img
                src={preview || currentAvatar}
                alt="Preview"
                className="h-32 w-32 rounded-full object-cover ring-2 ring-slate-200"
              />
            )}
            {!preview && !currentAvatar && (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-100 text-2xl font-semibold text-slate-500">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Choose image
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            <button
              type="button"
              disabled={!file || uploading}
              onClick={handleUploadAvatar}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Upload photo'}
            </button>
          </div>
        </div>
      </section>

      <form onSubmit={handleSaveProfile} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Details</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="edit-bio" className="block text-sm font-medium text-slate-700">
              Bio
            </label>
            <textarea
              id="edit-bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-slate-500">{bio.length}/500</p>
            {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
