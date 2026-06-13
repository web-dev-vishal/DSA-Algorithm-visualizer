import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  resourceId: {
    type: String
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  changes: {
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed }
  }
}, {
  timestamps: true
});

AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ resource: 1 });
AuditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
export default AuditLog;
