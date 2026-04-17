import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signAccessToken } from '../services/tokenService.js';

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashed,
    });
    const token = signAccessToken(user._id.toString());
    return res.status(201).json({
      success: true,
      message: 'Account created',
      data: { user, token },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    user.password = undefined;
    const token = signAccessToken(user._id.toString());
    return res.json({
      success: true,
      message: 'Logged in',
      data: { user, token },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
}
