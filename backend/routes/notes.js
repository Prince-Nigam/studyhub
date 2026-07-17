const express = require('express');
const router = express.Router();
const { getNotes, getNote, createNote, updateNote, deleteNote } = require('../controllers/notesController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../utils/multer');

router.get('/', protect, getNotes);
router.get('/:id', protect, getNote);
router.post('/', adminOnly, upload.single('file'), createNote);
router.put('/:id', adminOnly, updateNote);
router.delete('/:id', adminOnly, deleteNote);

module.exports = router;
