import mongoose from 'mongoose';
import { setting } from './env.js';

// One connection per process, reused across requests. On Vercel each function instance keeps it while warm,
// so a request never opens a fresh connection when one is already up.
let connecting = null;

const connectDB = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);
  // A connection that was up and has since dropped (0 disconnected, 3 disconnecting) gets a fresh connect.
  if (connecting && mongoose.connection.readyState !== 2) connecting = null;
  if (!connecting) {
    connecting = mongoose
      // 5 s keeps a failed connect well inside Vercel's function time limit, so callers get the JSON 503.
      .connect(setting('MONGODB_URI', 'mongodb://localhost:27017/medi-cloud'), { serverSelectionTimeoutMS: 5000 })
      .then((m) => {
        console.log('MongoDB Connected');
        return m.connection;
      })
      .catch((error) => {
        connecting = null; // let the next request try again
        throw error;
      });
  }
  return connecting;
};

export default connectDB;
