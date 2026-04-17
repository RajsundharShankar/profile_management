import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/client';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!currentPassword) e.currentPassword = 'Current password is required';
    if (!newPassword) e.newPassword = 'New password is required';
    else if (newPassword.length < 8) e.newPassword = 'At least 8 characters';
    else if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      e.newPassword = 'Include one letter and one number';
    }
    if (newPassword !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { data } = await api.put('/users/change-password', {
        currentPassword,
        newPassword,
      });
      if (data.success) {
        toast.success(data.message || 'Password updated');
        setCurrentPassword('');
        setNewPassword('');
        setConfirm('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Change password</h1>
        <p className="text-slate-600">Use a strong password you have not used elsewhere</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="current" className="block text-sm font-medium text-slate-700">
              Current password
            </label>
            <input
              id="current"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
            />
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
            )}
          </div>
          <div>
            <label htmlFor="new-pass" className="block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              id="new-pass"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
            />
            {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
          </div>
          <div>
            <label htmlFor="confirm-pass" className="block text-sm font-medium text-slate-700">
              Confirm new password
            </label>
            <input
              id="confirm-pass"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
            />
            {errors.confirm && <p className="mt-1 text-sm text-red-600">{errors.confirm}</p>}
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
