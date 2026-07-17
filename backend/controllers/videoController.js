const Video = require('../models/Video');

// Extract YouTube ID from URL
function extractYoutubeId(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// @desc    Get videos
// @route   GET /api/videos
exports.getVideos = async (req, res) => {
  try {
    const { classId, subjectId, chapterId, type, search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (classId) query.classId = classId;
    if (subjectId) query.subjectId = subjectId;
    if (chapterId) query.chapterId = chapterId;
    if (type) query.type = type;
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;
    const videos = await Video.find(query)
      .populate('chapterId', 'name')
      .populate('subjectId', 'name color')
      .populate('classId', 'name grade')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Video.countDocuments(query);

    res.json({ success: true, count: videos.length, total, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('chapterId', 'name')
      .populate('subjectId', 'name color')
      .populate('classId', 'name grade');

    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    video.viewCount += 1;
    await video.save({ validateBeforeSave: false });

    // Get related videos
    const related = await Video.find({
      subjectId: video.subjectId,
      _id: { $ne: video._id },
      isActive: true
    }).limit(6).select('title thumbnailUrl duration youtubeId');

    res.json({ success: true, data: video, related });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create video (Admin)
// @route   POST /api/videos
exports.createVideo = async (req, res) => {
  try {
    const videoData = { ...req.body, uploadedBy: req.user._id };

    if (videoData.youtubeUrl) {
      videoData.youtubeId = extractYoutubeId(videoData.youtubeUrl);
      if (!videoData.thumbnailUrl && videoData.youtubeId) {
        videoData.thumbnailUrl = `https://img.youtube.com/vi/${videoData.youtubeId}/maxresdefault.jpg`;
      }
    }

    const video = await Video.create(videoData);
    res.status(201).json({ success: true, data: video, message: 'Video added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update video (Admin)
// @route   PUT /api/videos/:id
exports.updateVideo = async (req, res) => {
  try {
    if (req.body.youtubeUrl) {
      req.body.youtubeId = extractYoutubeId(req.body.youtubeUrl);
    }
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete video (Admin)
// @route   DELETE /api/videos/:id
exports.deleteVideo = async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
