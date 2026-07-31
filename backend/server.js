const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const Post = require("./models/Post");


const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "1234";
const app = express();
console.log("🚀 NEW SERVER");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (username !== ADMIN_USERNAME) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  

 if (password !== ADMIN_PASSWORD) {
  return res.status(401).json({
    message: "Invalid credentials",
  });
}

  const token = jwt.sign(
    { username },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  res.json({ token });
});
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Access denied",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.post("/posts", upload.single("image"), async (req, res) => {
  try {
    const newPost = await Post.create({
      text: req.body.text,

      image: req.file ? `/uploads/${req.file.filename}` : "",

      likes: 0,

      comments: [],

      pendingEdits: [],

      approvedEdits: [],
    });

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
app.put("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        text: req.body.text,
      },
      {
        new: true,
      }
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
app.delete("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json({
      message: "Post deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
app.patch("/posts/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.likes += 1;

    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
app.post("/posts/:id/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.comments.push({
      text: req.body.text,
      likes: 0,
      replies: [],
    });

    await post.save();

    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
app.patch("/posts/:postId/comments/:commentId/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    comment.likes++;

    await post.save();

    res.json(comment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
app.post("/posts/:postId/comments/:commentId/replies", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    comment.replies.push({
      text: req.body.text,
    });

    await post.save();

    res.status(201).json(comment.replies[comment.replies.length - 1]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
app.post("/posts/:id/edit-request", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.pendingEdits.push({
      author: req.body.author,
      text: req.body.text,
      likes: 0,
    });

    await post.save();

    res.status(201).json(
      post.pendingEdits[post.pendingEdits.length - 1]
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
app.get("/posts/:id/edit-requests", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    res.json(post.pendingEdits);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
app.patch("/posts/:id/edit-request/:editId/approve", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const edit = post.pendingEdits.id(req.params.editId);

    if (!edit) {
      return res.status(404).json({
        message: "Edit not found",
      });
    }

    post.approvedEdits.push({
      author: edit.author,
      text: edit.text,
      likes: 0,
    });

    edit.deleteOne();

    await post.save();

    res.json({
      message: "Approved",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
app.delete("/posts/:id/edit-request/:editId", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const edit = post.pendingEdits.id(req.params.editId);

    if (!edit) {
      return res.status(404).json({
        message: "Edit not found",
      });
    }

    edit.deleteOne();

    await post.save();

    res.json({
      message: "Deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
app.patch("/posts/:postId/approved-edits/:editId/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const edit = post.approvedEdits.id(req.params.editId);

    if (!edit) {
      return res.status(404).json({
        message: "Edit not found",
      });
    }

    edit.likes++;

    await post.save();

    res.json(edit);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });
app.listen(5001, () => {
  console.log("Server running on http://localhost:5001");
});
