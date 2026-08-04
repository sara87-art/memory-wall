const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  username: String,

  avatar: {
    type: String,
    default: "",
  },

  text: String,

  likes: {
    type: Number,
    default: 0,
  },
});

const commentSchema = new mongoose.Schema({
  username: String,

  avatar: {
    type: String,
    default: "",
  },

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

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    username: {
      type: String,
    },
    avatar: {
      type: String,
      default: "",
    },
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
  },
);

module.exports = mongoose.model("Post", postSchema);
