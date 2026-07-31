const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  text: String,
});

const commentSchema = new mongoose.Schema({
  text: String,
  likes: {
    type: Number,
    default: 0,
  },
  replies: [replySchema],
});

const editSchema = new mongoose.Schema({
  author: String,
  text: String,
  likes: {
    type: Number,
    default: 0,
  },
});

const postSchema = new mongoose.Schema(
  {
    text: String,

    image: String,

    likes: {
      type: Number,
      default: 0,
    },

    comments: [commentSchema],

    pendingEdits: [editSchema],

    approvedEdits: [editSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);