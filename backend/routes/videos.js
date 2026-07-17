const express = require('express');
const router = express.Router();
const { getVideos, getVideo, createVideo, updateVideo, deleteVideo } = require('../controllers/videoController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getVideos);
router.get('/:id', protect, getVideo);
router.post('/', adminOnly, createVideo);
router.put('/:id', adminOnly, updateVideo);
router.delete('/:id', adminOnly, deleteVideo);

module.exports = router;
