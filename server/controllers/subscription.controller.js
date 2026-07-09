import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Toggle subscription
// @route   POST /api/v1/subscriptions/toggle/:channelId
// @access  Private
export const toggleSubscription = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    if (channelId.toString() === subscriberId.toString()) {
      res.status(400);
      throw new Error('You cannot subscribe to your own channel');
    }

    const channel = await User.findById(channelId);
    if (!channel) {
      res.status(404);
      throw new Error('Channel not found');
    }

    const existingSubscription = await Subscription.findOne({
      subscriber: subscriberId,
      channel: channelId,
    });

    if (existingSubscription) {
      // Unsubscribe
      await existingSubscription.deleteOne();
      return res.json({
        success: true,
        message: 'Unsubscribed successfully',
        data: { subscribed: false },
      });
    } else {
      // Subscribe
      await Subscription.create({
        subscriber: subscriberId,
        channel: channelId,
      });

      // Create notification
      await Notification.create({
        sender: subscriberId,
        receiver: channelId,
        type: 'subscribe',
      });

      return res.json({
        success: true,
        message: 'Subscribed successfully',
        data: { subscribed: true },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get channel subscribers list
// @route   GET /api/v1/subscriptions/subscribers/:channelId
// @access  Public
export const getChannelSubscribers = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    const subscribers = await Subscription.find({ channel: channelId })
      .populate('subscriber', 'fullName username avatar bio');

    res.json({
      success: true,
      data: subscribers.map(sub => sub.subscriber),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get channels a user has subscribed to
// @route   GET /api/v1/subscriptions/channels/:subscriberId
// @access  Public
export const getSubscribedChannels = async (req, res, next) => {
  try {
    const { subscriberId } = req.params;

    const subscriptions = await Subscription.find({ subscriber: subscriberId })
      .populate('channel', 'fullName username avatar bio');

    res.json({
      success: true,
      data: subscriptions.map(sub => sub.channel),
    });
  } catch (error) {
    next(error);
  }
};
