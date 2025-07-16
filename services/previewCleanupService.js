const Preview = require('../models/Preview');

/**
 * Clean up old previews (older than 24 hours)
 * This is a backup cleanup in case TTL index doesn't work
 */
async function cleanupOldPreviews() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await Preview.deleteMany({
      createdAt: { $lt: oneDayAgo }
    });
    
    console.log(`Cleaned up ${result.deletedCount} old previews`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up old previews:', error);
    throw error;
  }
}

/**
 * Get preview by ID
 */
async function getPreviewById(previewId) {
  try {
    return await Preview.findOne({ id: previewId });
  } catch (error) {
    console.error('Error getting preview by ID:', error);
    throw error;
  }
}

/**
 * Save preview to database
 */
async function savePreview(previewData) {
  try {
    const preview = new Preview(previewData);
    return await preview.save();
  } catch (error) {
    console.error('Error saving preview:', error);
    throw error;
  }
}

/**
 * Get preview statistics
 */
async function getPreviewStats() {
  try {
    const totalPreviews = await Preview.countDocuments();
    const recentPreviews = await Preview.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    });
    
    return {
      total: totalPreviews,
      recent: recentPreviews
    };
  } catch (error) {
    console.error('Error getting preview stats:', error);
    throw error;
  }
}

module.exports = {
  cleanupOldPreviews,
  getPreviewById,
  savePreview,
  getPreviewStats
}; 