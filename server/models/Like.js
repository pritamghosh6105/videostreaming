import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      default: null,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'dislike'],
      default: 'like',
    },
  },
  {
    timestamps: true,
  }
);

// A user can like/dislike a video or comment only once
likeSchema.index({ video: 1, comment: 1, likedBy: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);
export default Like;
