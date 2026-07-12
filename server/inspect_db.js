import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Video from './models/Video.js';
import User from './models/User.js';

dotenv.config();

const testQuery = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    const category = 'comedy';
    const bannedUsers = await User.find({ isBanned: true }).select('_id');
    const bannedUserIds = bannedUsers.map((u) => u._id);

    const matchRules = { isPublished: true };
    matchRules.owner = { $nin: bannedUserIds };

    let catId = category;
    if (!mongoose.Types.ObjectId.isValid(category)) {
      const cat = await Category.findOne({ slug: category });
      if (cat) catId = cat._id;
    }
    matchRules.category = new mongoose.Types.ObjectId(catId);

    console.log('Match Rules:', JSON.stringify(matchRules, null, 2));

    // Test simple find
    const simpleFind = await Video.find(matchRules);
    console.log('Simple find result count:', simpleFind.length);
    console.log('Simple find titles:', simpleFind.map(v => v.title));

    // Test pipeline
    const pipeline = [];
    pipeline.push({ $match: matchRules });
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'ownerDetails',
      },
    });
    pipeline.push({ $unwind: '$ownerDetails' });

    const pipelineResult = await Video.aggregate(pipeline);
    console.log('Pipeline result count:', pipelineResult.length);
    console.log('Pipeline titles:', pipelineResult.map(v => v.title));

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

testQuery();
