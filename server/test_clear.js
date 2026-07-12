import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find the user 'army'
    const user = await User.findOne({ username: 'army' });
    if (!user) {
      console.log("User 'army' not found!");
      process.exit(1);
    }
    
    console.log(`Before clearing: army watchHistory count = ${user.watchHistory.length}`);
    
    // Perform update
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      $set: { watchHistory: [] },
    }, { new: true });
    
    console.log(`After clearing: army watchHistory count = ${updatedUser.watchHistory.length}`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
