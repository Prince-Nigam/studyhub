const Notification = require('../models/Notification');

/**
 * Send a global notification to all students
 * @param {object} opts - { title, message, type, link, adminId }
 */
const notifyAll = async ({ title, message, type = 'info', link = '', adminId }) => {
  try {
    await Notification.create({
      isGlobal: true,
      title,
      message,
      type,
      link,
      createdBy: adminId,
    });
  } catch (err) {
    console.error('Notify error:', err.message);
  }
};

module.exports = { notifyAll };
