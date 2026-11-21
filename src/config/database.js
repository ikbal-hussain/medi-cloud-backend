import mongoose from 'mongoose';

// One connection per process, reused across requests. On Vercel each function instance keeps it while warm,
// so a request never opens a fresh connection when one is already up.
let connecting = null;

const connectDB = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);
  if (!connecting) {
    connecting = mongoose
      .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medi-cloud', { serverSelectionTimeoutMS: 10000 })
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
