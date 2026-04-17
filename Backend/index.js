import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { getCorsOptions } from './config/cors.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

await connectDB();

const app = express();

// ✅ CORS (must be FIRST)
app.use(cors(getCorsOptions()));

// ✅ Handle preflight properly
app.options('*', cors(getCorsOptions()));

// ✅ Middleware
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// ✅ Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// ✅ Error handler
app.use((err, _req, res, _next) => {
  console.error(err);

  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large (max 5MB)' });
  }

  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ❌ REMOVE app.listen for Vercel
// app.listen(...)

// ✅ EXPORT for Vercel
export default app;