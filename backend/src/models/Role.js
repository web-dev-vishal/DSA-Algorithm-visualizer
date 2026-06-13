import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  permissions: [{
    type: String // Slugs of permissions
  }],
  level: {
    type: Number,
    required: true,
    default: 1
  }
}, {
  timestamps: true
});

RoleSchema.index({ name: 1 }, { unique: true });

const Role = mongoose.model('Role', RoleSchema);
export default Role;
