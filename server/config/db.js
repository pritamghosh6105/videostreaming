import mongoose from 'mongoose';

const connectDB = async () => {
  while (true) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`Database Connection Error: ${error.message}`);
      console.log('Retrying DB connection in 5 seconds...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

export default connectDB;
