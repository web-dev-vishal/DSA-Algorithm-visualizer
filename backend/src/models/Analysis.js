import mongoose from 'mongoose';

const CodeLineSchema = new mongoose.Schema({
  line: { type: String, required: true },
  explain: { type: String, default: '' }
}, { _id: false });

const VisualizationStepSchema = new mongoose.Schema({
  arr: [{ type: Number }],
  highlight: [{ type: Number }],
  secondary: [{ type: Number }],
  done: [{ type: Number }],
  eliminated: [{ type: Number }],
  swap: [{ type: Number }],
  pointers: { type: Map, of: String },
  activeLine: { type: Number, required: true },
  msg: { type: String, required: true }
}, { _id: false });

const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // SHA-256 hash of (code + JSON.stringify(defaultInput)) used for fast cache lookups
  codeHash: {
    type: String,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  algorithmName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  isCorrect: {
    type: Boolean,
    default: true
  },
  bugs: [{ type: String }],
  correctedCode: {
    type: String,
    default: ''
  },
  timeComplexity: {
    type: String,
    required: true
  },
  spaceComplexity: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  howItWorks: [{ type: String }],
  codeLines: [CodeLineSchema],
  defaultInput: [{ type: Number }],
  steps: [VisualizationStepSchema],
  shared: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// ── Indexes ───────────────────────────────────────────────────────────
AnalysisSchema.index({ codeHash: 1 });                     // Cache lookups
AnalysisSchema.index({ userId: 1, createdAt: -1 });        // User history pagination
AnalysisSchema.index({ category: 1 });                     // Category filter
AnalysisSchema.index({ shared: 1 });                       // Public shared lookups
AnalysisSchema.index({ createdAt: -1 });                   // General sorting

const Analysis = mongoose.model('Analysis', AnalysisSchema);
export default Analysis;
