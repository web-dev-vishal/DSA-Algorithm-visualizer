import mongoose from 'mongoose';

const SecurityEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  email: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: [
      'login',           // Successful login
      'failed_login',    // Failed login attempt
      'logout',          // User-initiated logout
      'logout_all',      // All-sessions logout
      'lockout',         // Account locked due to too many failures
      'password_change', // Password was changed
      'password_reset',  // Password was reset via forgot-password flow
      'token_reuse',     // Refresh token reuse detected (compromise alert)
      'account_deactivated', // Account self-deactivated
      'suspicious_activity'  // Generic suspicious activity
    ],
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
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true
});

// ── Indexes ───────────────────────────────────────────────────────────
SecurityEventSchema.index({ userId: 1, createdAt: -1 }); // User security timeline
SecurityEventSchema.index({ eventType: 1 });             // Filter by event type
SecurityEventSchema.index({ ipAddress: 1 });             // IP-based analysis
SecurityEventSchema.index({ createdAt: -1 });            // Global timeline

const SecurityEvent = mongoose.model('SecurityEvent', SecurityEventSchema);
export default SecurityEvent;
