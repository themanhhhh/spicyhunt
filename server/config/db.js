import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Mongoose 6+ doesn't need useNewUrlParser and useUnifiedTopology
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Full error:', error);
    // Don't exit process, throw error instead so server can still respond
    throw error;
  }
};

export default connectDB;
