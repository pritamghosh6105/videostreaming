import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'poll'],
      default: 'text',
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
    },
    attachment: {
      type: String, // Cloudinary image URL or local storage path
      default: '',
    },
    attachmentPublicId: {
      type: String,
      default: '',
    },
    pollOptions: [
      {
        optionText: {
          type: String,
          required: true,
        },
        votes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);
export default CommunityPost;
