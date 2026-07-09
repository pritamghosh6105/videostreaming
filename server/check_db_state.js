import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Report from './models/Report.js';
import Comment from './models/Comment.js';
import CommunityComment from './models/CommunityComment.js';
import Video from './models/Video.js';
import CommunityPost from './models/CommunityPost.js';
import User from './models/User.js';

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const reports = await Report.find({ type: 'comment' });
    console.log("=== COMMENT REPORTS ===");
    for (let r of reports) {
      console.log(`Report ID: ${r._id}, TargetId: ${r.targetId}, Status: ${r.status}`);
      const vc = await Comment.findById(r.targetId);
      const cc = await CommunityComment.findById(r.targetId);
      console.log(`- Video Comment exists: ${!!vc}`);
      console.log(`- Community Comment exists: ${!!cc}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
