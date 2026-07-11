import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String, // Cloudinary URL
      required: [true, 'Video file is required'],
    },
    videoPublicId: {
      type: String, // Cloudinary Public ID for deletion
      required: [true, 'Video public ID is required'],
    },
    thumbnail: {
      type: String, // Cloudinary URL
      required: [true, 'Thumbnail is required'],
    },
    thumbnailPublicId: {
      type: String, // Cloudinary Public ID for deletion
      required: [true, 'Thumbnail public ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    duration: {
      type: Number, // In seconds (from Cloudinary metadata)
      required: [true, 'Duration is required'],
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    dislikesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret.videoPublicId;
        delete ret.thumbnailPublicId;
        return ret;
      }
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret.videoPublicId;
        delete ret.thumbnailPublicId;
        return ret;
      }
    }
  }
);

// Search indexes
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Video = mongoose.model('Video', videoSchema);
export default Video;
