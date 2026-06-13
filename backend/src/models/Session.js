import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userAgent: {
    type: String,
    default: 'Unknown'
  },
  ipAddress: {
    type: String,
    default: 'Unknown'
  },
  deviceType: {
    type: String,
    default: 'desktop'
  },
  os: {
    type: String,
    default: 'Unknown'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  refreshTokHash: {
    type: String,
    required: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isRevoked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

SessionSchema.index({ userId: 1 });
SessionSchema.index({ refreshTokHash: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic deletion

const Session = mongoose.model('Session', SessionSchema);
export default Session;
