const mongoose = require('mongoose');

const previewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  subject: { type: String, required: true },
  html: { type: String, required: true },
  prompt: { type: String, required: true },
  headers: [{ type: String }],
  sampleRow: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // 24 hours in seconds
});

module.exports = mongoose.model('Preview', previewSchema); 