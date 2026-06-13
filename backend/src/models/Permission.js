import mongoose from 'mongoose';

const PermissionSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

PermissionSchema.index({ slug: 1 }, { unique: true });

const Permission = mongoose.model('Permission', PermissionSchema);
export default Permission;
