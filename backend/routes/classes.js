const express = require('express');
const router = express.Router();
const { getClasses, getClass, createClass, updateClass, deleteClass, seedClasses } = require('../controllers/classController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getClasses);
router.get('/:id', protect, getClass);
router.post('/seed', seedClasses);
router.post('/', adminOnly, createClass);
router.put('/:id', adminOnly, updateClass);
router.delete('/:id', adminOnly, deleteClass);

module.exports = router;
