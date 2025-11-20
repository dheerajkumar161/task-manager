const express = require('express');
const { getUsers, getUserProfile, updateUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/', getUsers);
router.get('/:id', getUserProfile);
router.put('/:id', updateUser);

module.exports = router;

