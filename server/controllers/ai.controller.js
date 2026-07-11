import { GoogleGenerativeAI } from '@google/generative-ai';
import Video from '../models/Video.js';
import User from '../models/User.js';

// @desc    Interact with AI Assistant
// @route   POST /api/v1/ai/chat
// @access  Public (Optional Authentication)
export const chatWithAI = async (req, res, next) => {
  try {
    const { message, history, context, config } = req.body;

    if (!message) {
      res.status(400);
      throw new Error('Message is required');
    }

    // 1. Search database to ground the prompt with real video data
    const cleanedQuery = message.replace(/[^\w\s]/g, '').trim();
    let groundedVideos = [];

    const bannedUsers = await User.find({ isBanned: true }).select('_id');
    const bannedUserIds = bannedUsers.map((u) => u._id);

    // If query has keywords, do a search
    if (cleanedQuery.length > 2) {
      groundedVideos = await Video.find({
        isPublished: true,
        owner: { $nin: bannedUserIds },
        $or: [
          { title: { $regex: cleanedQuery, $options: 'i' } },
          { description: { $regex: cleanedQuery, $options: 'i' } },
          { tags: { $regex: cleanedQuery, $options: 'i' } }
        ]
      })
      .limit(3)
      .populate('owner', 'username');
    }

    // Fallback: If no search matches, get the most viewed videos
    if (groundedVideos.length === 0) {
      groundedVideos = await Video.find({
        isPublished: true,
        owner: { $nin: bannedUserIds },
      })
        .sort({ views: -1 })
        .limit(3)
        .populate('owner', 'username');
    }

    let systemInstruction = `You are a helpful, friendly, and smart AI Assistance system integrated into a YouTube-like video streaming platform.
Your goal is to help users navigate the site, suggest video ideas, explain platform features, and recommend actual videos.
Always answer in a supportive and conversational tone. Format your answers nicely with bullet points or bold text where appropriate.

If the user asks general knowledge questions or questions unrelated to the video streaming platform (such as "what is paracetamol?", general science, history, programming, etc.):
1. Briefly remind the user that your primary scope is to help with this video streaming platform.
2. Directly and fully answer their question in a helpful and accurate manner.
3. Do not refuse to answer off-topic questions.

`;

    // Add Watch Video Page Context
    if (context && context.video) {
      systemInstruction += `Currently, the user is watching this video:
- Title: "${context.video.title}"
- Description: "${context.video.description}"
- Views: ${context.video.views}
- Tags: ${context.video.tags ? context.video.tags.join(', ') : 'none'}
- Owner: @${context.video.ownerName || 'creator'}

If the user asks to summarize, review, explain, or answer questions about this video, use this description and metadata to assist them.
`;
    }

    // Add Database Video Grounding Context
    if (groundedVideos && groundedVideos.length > 0) {
      systemInstruction += `\nHere are some actual videos from the application database that you can suggest/recommend:
` + groundedVideos.map(v => `- Title: "${v.title}" (Link: [${v.title}](/watch/${v._id})), Creator: @${v.owner?.username || 'unknown'}, Views: ${v.views}, Description: "${v.description.substring(0, 100)}..."`).join('\n') + `
When the user asks for recommendations, search results, or what to watch, ALWAYS recommend these specific videos and include their exact markdown links (e.g., [Video Title](/watch/id)). Do NOT hallucinate or make up invalid URLs.`;
    }

    // Add User personalization if logged in
    if (req.user) {
      systemInstruction += `\nThe logged-in user's username is @${req.user.username}. Address them by their username if appropriate.`;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 3. Process with live Gemini AI or Fallback Mock
    if (apiKey && apiKey !== 'your_gemini_api_key' && apiKey.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const temperature = config?.temperature !== undefined ? parseFloat(config.temperature) : 0.7;
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: systemInstruction,
          generationConfig: {
            temperature,
          }
        });

        // Format history for Gemini API
        const formattedHistory = (history || []).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }));

        const chat = model.startChat({
          history: formattedHistory,
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        return res.json({
          success: true,
          reply: responseText,
          isMock: false,
        });
      } catch (geminiError) {
        console.error('Gemini API Error, falling back to local simulation:', geminiError);
        // Fall through to mock logic on error
      }
    }

    // 4. Fallback Local Mock System
    let reply = '';
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('summarize') || lowerMessage.includes('summary') || lowerMessage.includes('explain this video')) {
      if (context && context.video) {
        reply = `Here is a summary of the video **"${context.video.title}"**:\n\n${context.video.description || 'No description provided.'}\n\n* **Views:** ${context.video.views}\n* **Creator:** @${context.video.ownerName || 'creator'}\n\n*(Note: Live Gemini AI is disabled because GEMINI_API_KEY is not configured in the server's .env file. This is a local database summary.)*`;
      } else {
        reply = `To summarize a video, please navigate to any video's watch page and click the **"Summarize this video"** suggestion chip or ask me there!`;
      }
    } else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('watch') || lowerMessage.includes('video') || lowerMessage.includes('search') || lowerMessage.includes('find')) {
      reply = `I found some top videos for you on our platform:\n\n` +
        groundedVideos.map(v => `🎥 **[${v.title}](/watch/${v._id})**\n   *Created by @${v.owner?.username || 'unknown'} • ${v.views} views*`).join('\n\n') +
        `\n\n*Tip: Configure \`GEMINI_API_KEY\` in your server's \`.env\` file to unlock natural-language explanations and full conversation capability!*`;
    } else if (lowerMessage.includes('playlist')) {
      reply = `To create or manage playlists on this platform:\n1. Click on any video to watch it.\n2. Click the **"Save"** or **"Add to Playlist"** button below the video player.\n3. Create a new playlist or select an existing one.\n4. Access your playlists in the **Library** or sidebar under your channel!`;
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      const name = req.user ? `@${req.user.username}` : 'guest';
      reply = `Hello ${name}! 👋 Welcome to the YouTube Clone AI Assistance. I can help you search/recommend videos, summarize what you're watching, and explain site features.\n\nTry clicking one of the suggestions below, or ask me anything!`;
    } else {
      reply = `Hello! I am your local AI Assistance. 

To enable full conversational abilities powered by Google's Gemini LLM, please add your \`GEMINI_API_KEY\` to the server's \`.env\` file.

In the meantime, you can still ask me to:
* **"Recommend videos"** or search terms (I will retrieve matching videos from the DB)
* **"Summarize this video"** (when you are watching a video)
* **"Explain playlists"** (how to save videos)

How can I help you today?`;
    }

    return res.json({
      success: true,
      reply,
      isMock: true,
    });
  } catch (error) {
    next(error);
  }
};
