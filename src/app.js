import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import { isDeployed } from './config/env.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import tenantRoutes from './routes/tenants.js';
import patientRoutes from './routes/patients.js';
import prescriptionRoutes from './routes/prescriptions.js';

// The Express app, shared by src/server.js (local / long-running) and api/index.js (Vercel).
const app = express();

// Browsers may call the API only from the Medi Cloud app (CORS_ORIGINS, comma-separated) and, locally, localhost.
const allowed = (process.env.CORS_ORIGINS || 'https://medi-cloud-app.netlify.app')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, done) =>
      done(null, !origin || allowed.includes(origin) || (!isDeployed && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))),
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check answers without the database, so it shows the server itself is up.
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// The API routes need the database: wait for the (cached) connection first. Unknown paths skip it and get a quick 404.
const needsDb = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error.message);
    res.status(503).json({ error: 'Database unavailable, try again shortly' });
  }
};
app.use(['/api/auth', '/api/users', '/api/tenants', '/api/patients', '/api/prescriptions'], needsDb);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  console.error(err.stack);
  res.status(err.status && err.status < 500 ? err.status : 500).json({ error: err.status && err.status < 500 ? err.message : 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
