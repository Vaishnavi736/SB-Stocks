const mongoose = require('mongoose');

const connectDB = async () => {
  // Reuse the existing connection on warm serverless invocations instead of
  // opening a new one on every request.
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sb-stocks', {
      autoIndex: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Vercel serverless functions must not exit the process on a failed
    // connection attempt — that would crash the whole runtime/container
    // instead of just failing the current request.
    if (process.env.VERCEL) {
      throw error;
    }
    process.exit(1);
  }
};

module.exports = connectDB;
