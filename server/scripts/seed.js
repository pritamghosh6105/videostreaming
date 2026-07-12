import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User.js';
import Video from '../models/Video.js';
import Category from '../models/Category.js';
import Comment from '../models/Comment.js';

dotenv.config();

const categoriesData = [
  { name: 'Gaming', slug: 'gaming' },
  { name: 'Music', slug: 'music' },
  { name: 'Technology', slug: 'technology' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Comedy', slug: 'comedy' },
  { name: 'Education', slug: 'education' },
  { name: 'Entertainment', slug: 'entertainment' },
];

const sampleVideos = [
  {
    title: 'Big Buck Bunny - Official Blender CGI Short Movie',
    description: 'A large and lovable rabbit deals with harassing woodland creatures in this classic open-source animation project created by the Blender Foundation.',
    videoFile: 'https://raw.githubusercontent.com/mediaelement/mediaelement-files/master/big_buck_bunny.mp4',
    videoPublicId: 'sample_bunny_id',
    thumbnail: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800',
    thumbnailPublicId: 'sample_bunny_thumb_id',
    duration: 60,
    tags: ['blender', 'cgi', 'animation', 'movie'],
  },
  {
    title: 'Echo Here We Are - CGI Demonstration Film',
    description: 'A cinematic demo showing off sound synthesis, character animations, and rendering layers.',
    videoFile: 'https://raw.githubusercontent.com/mediaelement/mediaelement-files/master/echo-hereweare.mp4',
    videoPublicId: 'sample_elephants_id',
    thumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800',
    thumbnailPublicId: 'sample_elephants_thumb_id',
    duration: 65,
    tags: ['sound', 'demo', 'animation', 'cgi'],
  },
  {
    title: 'W3Schools Bunny Clip - Lightweight HTML5 Demonstration',
    description: 'An educational video depicting standard HTML5 media streaming and responsive codec validations.',
    videoFile: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoPublicId: 'sample_blazes_id',
    thumbnail: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800',
    thumbnailPublicId: 'sample_blazes_thumb_id',
    duration: 10,
    tags: ['html5', 'video', 'test', 'clip'],
  },
  {
    title: 'W3Schools Bear Clip - Toy Bear Playful Scene',
    description: 'A short CGI animation demonstrating browser performance metrics, buffering states, and custom player capabilities.',
    videoFile: 'https://www.w3schools.com/html/movie.mp4',
    videoPublicId: 'sample_sintel_id',
    thumbnail: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800',
    thumbnailPublicId: 'sample_sintel_thumb_id',
    duration: 5,
    tags: ['bear', 'animation', 'browser', 'performance'],
  },
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // Clear existing data
    console.log('Clearing old collections...');
    await Category.deleteMany();
    await User.deleteMany();
    await Video.deleteMany();
    await Comment.deleteMany();

    // Insert categories
    console.log('Seeding categories...');
    const insertedCategories = await Category.insertMany(categoriesData);
    console.log(`Inserted ${insertedCategories.length} categories.`);

    // Insert users
    console.log('Seeding users...');
    const adminUser = await User.create({
      fullName: 'Site Administrator',
      email: 'admin@viewflow.com',
      username: 'admin',
      password: 'adminpassword123',
      role: 'admin',
      bio: 'Master Administrator of the ViewFlow Video Streaming Platform.',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60',
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=60',
    });

    const creator1 = await User.create({
      fullName: 'CGI Animators Hub',
      email: 'cgi@viewflow.com',
      username: 'cgihub',
      password: 'creatorpassword123',
      role: 'user',
      bio: 'Bringing you the finest open-source CGI and 3D animated movies.',
      avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=60',
      banner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&auto=format&fit=crop&q=60',
    });

    const creator2 = await User.create({
      fullName: 'Daily Vlogger',
      email: 'vlogger@viewflow.com',
      username: 'dailyvlog',
      password: 'creatorpassword123',
      role: 'user',
      bio: 'Just sharing daily thoughts, travel stories, and technology reviews.',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=60',
      banner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=60',
    });

    console.log('Seeding sample videos...');
    // Map videos to creators and categories
    const videoData = sampleVideos.map((vid, idx) => {
      // Alternate owner between creator1 and creator2
      const owner = idx % 2 === 0 ? creator1._id : creator2._id;
      // Assign Animation categories (like Entertainment or Education)
      const category = idx % 2 === 0
        ? insertedCategories.find(c => c.slug === 'entertainment')._id
        : insertedCategories.find(c => c.slug === 'comedy')._id;

      return {
        ...vid,
        owner,
        category,
        views: Math.floor(Math.random() * 5000) + 100,
        likesCount: Math.floor(Math.random() * 200) + 10,
        dislikesCount: Math.floor(Math.random() * 10),
      };
    });

    const insertedVideos = await Video.insertMany(videoData);
    console.log(`Inserted ${insertedVideos.length} videos.`);

    // Add comment to the first video
    console.log('Seeding comments...');
    await Comment.create({
      content: 'This animation is absolutely timeless! The Blender team outdid themselves.',
      video: insertedVideos[0]._id,
      owner: creator2._id,
    });

    await Comment.create({
      content: 'Agreed! I still watch this in 2026.',
      video: insertedVideos[0]._id,
      owner: adminUser._id,
    });

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
