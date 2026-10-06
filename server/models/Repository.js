import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    owner: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    githubUrl: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    defaultBranch: {
      type: String,
      default: 'main',
    },
    stars: {
      type: Number,
      default: 0,
    },
    forks: {
      type: Number,
      default: 0,
    },
    openIssues: {
      type: Number,
      default: 0,
    },
    watchers: {
      type: Number,
      default: 0,
    },
    license: {
      type: String,
      default: 'None',
    },
    primaryLanguage: {
      type: String,
      default: 'Unknown',
    },
    languages: [
      {
        name: { type: String, required: true },
        bytes: { type: Number, required: true },
        percentage: { type: Number, required: true },
      },
    ],
    readme: {
      content: { type: String, default: '' },
      exists: { type: Boolean, default: false },
    },
    structure: {
      totalFiles: { type: Number, default: 0 },
      totalDirs: { type: Number, default: 0 },
      fileTree: [
        {
          path: { type: String, required: true },
          type: { type: String, enum: ['blob', 'tree'], default: 'blob' },
          size: { type: Number, default: 0 },
        },
      ],
      keyDirectories: [{ type: String }],
    },
    dependencies: {
      hasPackageJson: { type: Boolean, default: false },
      packageManager: { type: String, default: 'npm' },
      runtime: [
        {
          name: { type: String, required: true },
          version: { type: String, default: 'latest' },
        },
      ],
      dev: [
        {
          name: { type: String, required: true },
          version: { type: String, default: 'latest' },
        },
      ],
    },
    recentCommits: [
      {
        sha: { type: String },
        message: { type: String },
        author: { type: String },
        date: { type: Date },
      },
    ],
    analyzedAt: {
      type: Date,
      default: Date.now,
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

// Compound index to ensure uniqueness per user per repo
repositorySchema.index({ userId: 1, fullName: 1 }, { unique: true });

const Repository = mongoose.model('Repository', repositorySchema);

export default Repository;
