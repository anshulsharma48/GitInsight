import mongoose from 'mongoose';

const findingSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['security', 'quality', 'documentation', 'testing', 'architecture'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['high', 'medium', 'low', 'info'],
    required: true,
  },
  file: { type: String, default: 'General' },
  line: { type: Number, default: 1 },
  rule: { type: String, required: true },
  message: { type: String, required: true },
  source: { type: String, default: 'static-analyzer' },
});

const analysisSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    healthScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    categories: {
      codeQuality: { type: Number, default: 0 },
      security: { type: Number, default: 0 },
      documentation: { type: Number, default: 0 },
      maintainability: { type: Number, default: 0 },
      architecture: { type: Number, default: 0 },
      testing: { type: Number, default: 0 },
    },
    findings: [findingSchema],
    metrics: {
      totalFiles: { type: Number, default: 0 },
      testFiles: { type: Number, default: 0 },
      hasReadme: { type: Boolean, default: false },
      hasLicense: { type: Boolean, default: false },
      dependenciesCount: { type: Number, default: 0 },
      detectedPatternsCount: { type: Number, default: 0 },
    },
    aiSummary: { type: String, default: '' },
    aiRecommendations: [{ type: String }],
    aiOnboarding: {
      overview: { type: String, default: '' },
      techStack: { type: String, default: '' },
      architecture: { type: String, default: '' },
      keyDirectories: [{ type: String }],
      gettingStarted: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

analysisSchema.index({ repositoryId: 1, userId: 1 });

const Analysis = mongoose.model('Analysis', analysisSchema);

export default Analysis;
