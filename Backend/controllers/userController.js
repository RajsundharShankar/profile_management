import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.join(__dirname, '..', 'uploads');

function oldFilePathFromUrl(profileUrl) {
  if (!profileUrl || typeof profileUrl !== 'string') return null;
  const name = path.basename(profileUrl);
  if (!name || name.includes('..')) return null;
  return path.join(uploadRoot, name);
}

export async function getUser(req, res) {
  try {
    const { id } = req.params;
    if (req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'You can only access your own profile' });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, data: { user } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { id } = req.params;
    if (req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'You can only update your own profile' });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { name, bio, privacySettings } = req.body;
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (privacySettings && typeof privacySettings === 'object') {
      const p = user.privacySettings || {};
      if (privacySettings.profileVisibility !== undefined) {
        p.profileVisibility = privacySettings.profileVisibility;
      }
      if (privacySettings.showEmail !== undefined) {
        p.showEmail = privacySettings.showEmail;
      }
      if (privacySettings.showBio !== undefined) {
        p.showBio = privacySettings.showBio;
      }
      user.privacySettings = p;
    }
    await user.save();
    return res.json({ success: true, message: 'Profile updated', data: { user } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
}

export async function uploadAvatar(req, res) {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    const user = await User.findById(userId);
    if (!user) {
      if (req.file.path) fs.unlink(req.file.path, () => {});
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const publicPath = `/uploads/${req.file.filename}`;
    const previous = user.profileImage;
    user.profileImage = publicPath;
    await user.save();
    if (previous) {
      const oldPath = oldFilePathFromUrl(previous);
      if (oldPath && fs.existsSync(oldPath)) {
        fs.unlink(oldPath, () => {});
      }
    }
    return res.json({
      success: true,
      message: 'Profile picture updated',
      data: { user, profileImage: publicPath },
    });
  } catch (err) {
    console.error(err);
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    return res.status(500).json({ success: false, message: 'Failed to upload avatar' });
  }
}

export async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to change password' });
  }
}
