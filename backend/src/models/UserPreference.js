import mongoose from 'mongoose';

const UserPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  playbackSpeed: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  }
}, {
  timestamps: true
});

UserPreferenceSchema.index({ userId: 1 }, { unique: true });

const UserPreference = mongoose.model('UserPreference', UserPreferenceSchema);
export default UserPreference;
