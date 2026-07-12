import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({});
    console.log("=== USERS WATCH HISTORY ===");
    for (let u of users) {
      console.log(`User: ${u.username} (${u._id})`);
      console.log(`Watch History count: ${u.watchHistory ? u.watchHistory.length : 0}`);
      console.log(`Watch History:`, u.watchHistory);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
