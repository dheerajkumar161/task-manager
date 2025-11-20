const Joi = require('joi');
const Task = require('../models/Task');

const objectId = Joi.string().length(24).hex();

const taskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('', null),
  status: Joi.string().valid('pending', 'in-progress', 'completed').optional(),
  ownerId: objectId.optional(),
});

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { error, value } = taskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { ownerId, ...taskData } = value;
    const assignedUserId =
      req.user.role === 'admin' && ownerId ? ownerId : req.user.id;

    const task = await Task.create({
      ...taskData,
      status: taskData.status || 'pending',
      createdBy: assignedUserId,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error('Create task error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, userId } = req.query;
    const query = {};

    if (req.user.role === 'user') {
      query.createdBy = req.user.id;
    } else if (userId) {
      query.createdBy = userId;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'username role')
        .lean(),
      Task.countDocuments(query),
    ]);

    res.json({
      tasks,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (err) {
    console.error('Get tasks error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to view this task' });
    }

    res.json(task);
  } catch (err) {
    console.error('Get task by id error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to update this task' });
    }

    const { error, value } = taskSchema.validate(req.body, {
      presence: 'optional',
    });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { ownerId, ...updates } = value;
    Object.assign(task, updates);

    if (ownerId && req.user.role === 'admin') {
      task.createdBy = ownerId;
    }
    await task.save();

    res.json(task);
  } catch (err) {
    console.error('Update task error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Delete task error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };
