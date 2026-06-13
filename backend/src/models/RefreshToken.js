import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  isRevoked: {
    type: Boolean,
    default: false
  },
  replacedByToken: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// ── Indexes ───────────────────────────────────────────────────────────
RefreshTokenSchema.index({ token: 1 });                         // Fast token lookups
RefreshTokenSchema.index({ userId: 1 });                        // Per-user revocation
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto-cleanup

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);
export default RefreshToken;
