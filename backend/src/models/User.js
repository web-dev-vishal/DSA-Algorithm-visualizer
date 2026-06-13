import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[\w+\-.]+@[a-z\d\-.]+\.[a-z]+$/i,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Never return password in query results
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
    default: function () {
      return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(this.email || 'default')}`;
    }
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  // Email verification — stored in schema (not via strict:false)
  emailVerifyHash: {
    type: String,
    default: null,
    select: false
  },
  emailVerifyExpires: {
    type: Date,
    default: null,
    select: false
  },
  // Password reset — stored in schema (not via strict:false)
  passwordResetHash: {
    type: String,
    default: null,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    default: null,
    select: false
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
    type: Date,
    default: null
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

// ── Indexes ──────────────────────────────────────────────────────────
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ plan: 1 });
UserSchema.index({ deletedAt: 1 });
// TTL-based auto-cleanup of unverified accounts (optional, add if needed)
UserSchema.index({ emailVerifyExpires: 1 });

// ── Pre-save password hashing ────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ── Soft delete: exclude deleted users from FIND queries only ────────
// Limited to 'find' and 'findOne' to avoid breaking update operations
UserSchema.pre('find', function (next) {
  this.where({ deletedAt: null });
  next();
});
UserSchema.pre('findOne', function (next) {
  this.where({ deletedAt: null });
  next();
});

// ── Instance methods ─────────────────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

const User = mongoose.model('User', UserSchema);
export default User;
