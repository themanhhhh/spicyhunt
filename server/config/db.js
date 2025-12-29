import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Mongoose 6+ doesn't need useNewUrlParser and useUnifiedTopology
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Full error:', error);
    process.exit(1);
  }
};

export default connectDB;

