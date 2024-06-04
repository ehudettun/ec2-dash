const mongoose = require('mongoose');

const InstanceSchema = new mongoose.Schema({
  name: String,
  id: String,
  type: String,
  state: String,
  az: String,
  publicIp: String,
  privateIp: String,
  updatedAt: { type: Date, default: Date.now },
});

const Instance = mongoose.models.Instance || mongoose.model('Instance', InstanceSchema);

module.exports = Instance;
