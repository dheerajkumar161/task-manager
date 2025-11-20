const Joi = require('joi');
const User = require('../models/User');
const Task = require('../models/Task');

const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(30),
  role: Joi.string().valid('user', 'admin'),
}).min(1);

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ username: 1 });

    const taskCounts = await Task.aggregate([
      { $group: { _id: '$createdBy', count: { $sum: 1 } } },
    ]);
    const countMap = taskCounts.reduce((acc, curr) => {
      acc[curr._id?.toString()] = curr.count;
      return acc;
    }, {});

    const payload = users.map((user) => ({
      ...user.toObject(),
      taskCount: countMap[user._id.toString()] || 0,
    }));

    res.json(payload);
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tasks = await Task.find({ createdBy: id })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username role')
      .lean();

    res.json({ user, tasks });
  } catch (err) {
    console.error('Get user profile error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { error, value } = updateUserSchema.validate(req.body, {
      presence: 'optional',
    });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    if (value.username) {
      const existing = await User.findOne({
        username: value.username,
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: value },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Update user error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUsers, getUserProfile, updateUser };

