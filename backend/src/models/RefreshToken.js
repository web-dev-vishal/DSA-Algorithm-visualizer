import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
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

RefreshTokenSchema.index({ token: 1 }, { unique: true });
RefreshTokenSchema.index({ userId: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);
export default RefreshToken;
