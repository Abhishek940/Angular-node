const mongoose = require("mongoose");

const knowledgeSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true
    },

    chunkIndex: {
      type: Number,
      required: true
    },

    text: {
      type: String,
      required: true
    },

    embedding: {
      type: [Number],
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Knowledge",
  knowledgeSchema
);