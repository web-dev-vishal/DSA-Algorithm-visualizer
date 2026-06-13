import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

SettingSchema.index({ key: 1 }, { unique: true });

const Setting = mongoose.model('Setting', SettingSchema);
export default Setting;
