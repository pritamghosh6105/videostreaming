import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const resetPassword = async () => {
  const args = process.argv.slice(2);
  const username = args[0];
  const newPassword = args[1] || 'password123';

  if (!username) {
    console.log("Usage: node reset_password.js <username> [new_password]");
    console.log("Example: node reset_password.js pritam_06 mynewpassword");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      console.log(`ERROR: User @${username} not found in the database.`);
      process.exit(1);
    }
    
    user.password = newPassword;
    await user.save();
    
    console.log(`SUCCESS: Password for user @${username} has been reset to: ${newPassword}`);
    process.exit(0);
  } catch (err) {
    console.error("Error resetting password:", err);
    process.exit(1);
  }
};

resetPassword();
