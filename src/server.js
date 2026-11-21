import dotenv from 'dotenv';
dotenv.config();

const { default: app } = await import('./app.js');
const { default: connectDB } = await import('./config/database.js');

const PORT = process.env.PORT || 3000;

// Long-running server (local dev). On Vercel, api/index.js serves the same app instead.
connectDB().catch((error) => {
  console.error('Database connection error:', error);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
