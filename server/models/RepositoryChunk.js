import mongoose from 'mongoose';

const repositoryChunkSchema = new mongoose.Schema(
  {
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true,
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
    startLine: {
      type: Number,
      required: true,
    },
    endLine: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    keywords: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Compound index for fast retrieval per repo
repositoryChunkSchema.index({ repositoryId: 1, filePath: 1 });

const RepositoryChunk = mongoose.model('RepositoryChunk', repositoryChunkSchema);

export default RepositoryChunk;
