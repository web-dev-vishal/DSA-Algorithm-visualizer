import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Exclude from queries by default for safety
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'member', 'guest'],
    default: 'member'
  },
  plan: {
    type: String,
    enum: ['free', 'starter', 'pro', 'business', 'enterprise'],
    default: 'free'
  },
  avatar: {
    type: String,
    default: function() {
      return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(this.email || 'default')}`;
    }
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'deactivated'],
    default: 'active'
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ plan: 1 });
UserSchema.index({ deletedAt: 1 });

// Password hashing pre-save middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance methods
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Soft delete queries support
UserSchema.pre(/^find/, function(next) {
  this.where({ deletedAt: null });
  next();
});

const User = mongoose.model('User', UserSchema);
export default User;
