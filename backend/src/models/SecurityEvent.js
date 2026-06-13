import mongoose from 'mongoose';

const SecurityEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  eventType: {
    type: String,
    enum: ['failed_login', 'lockout', 'password_change', 'mfa_enabled', 'suspicious_login', 'logout_all'],
    required: true
  },
  ipAddress: {
    type: String,
    default: 'Unknown'
  },
  userAgent: {
    type: String,
    default: 'Unknown'
  },
  location: {
    type: String,
    default: 'Unknown'
  },
  riskScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

SecurityEventSchema.index({ userId: 1 });
SecurityEventSchema.index({ eventType: 1 });
SecurityEventSchema.index({ createdAt: -1 });

const SecurityEvent = mongoose.model('SecurityEvent', SecurityEventSchema);
export default SecurityEvent;
