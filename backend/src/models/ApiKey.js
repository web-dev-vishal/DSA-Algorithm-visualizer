import mongoose from 'mongoose';

const ApiKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  keyHash: {
    type: String,
    required: true,
    unique: true
  },
  keyMask: {
    type: String,
    required: true
  },
  lastUsed: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

ApiKeySchema.index({ userId: 1 });

const ApiKey = mongoose.model('ApiKey', ApiKeySchema);
export default ApiKey;
