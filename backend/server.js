const User = require("./models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const axios = require("axios");
const Post = require("./models/Post");
const admin = require("./firebase-admin");
const app = express();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log(__filename);
console.log("🚀 NEW SERVER");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "memory-wall",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });
app.post("/register", async (req, res) => {
  console.log("REGISTER ROUTE HIT");
  console.log(req.body);

  try {
    const { username, password } = req.body;
    const reservedNames = [
      "admin",
      "administrator",
      "support",
      "owner",
      "memorywall",
      "moderator",
    ];

    if (reservedNames.includes(username.toLowerCase())) {
      return res.status(400).json({
        message: "هذا الاسم محجوز، اختر اسمًا آخر.",
      });
    }
    if (username.length < 3) {
      return res.status(400).json({
        message: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل.",
      });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        message: "هذا الاسم مستخدم بالفعل، الرجاء اختيار اسم آخر.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      role: "user",
    });

    res.status(201).json({
      message: "Account created",
      id: user._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      token,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
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

    console.log("POSTS =", posts);

    if (posts.length > 0) {
      console.log("FIRST POST =", posts[0]);
      console.log("FIRST POST AVATAR =", posts[0].avatar);
    }

    res.json(posts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.post("/posts", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
 if (req.file) {
  const result = await checkImage(req.file.path);

  if (
    result.nudity.explicit > 0.3 ||
    result.nudity.sexual_activity > 0.3 ||
    result.nudity.erotica > 0.5 ||
    result.nudity.very_suggestive > 0.5 ||
    result.gore.prob > 0.3
  ) {
    return res.status(400).json({
      message: "الصورة تحتوي على محتوى غير مسموح.",
    });
  }
}
    const newPost = await Post.create({
      text: req.body.text,

      image: req.file ? req.file.path : "",

      userId: req.user.id,

      username: req.user.username,
      avatar: user.avatar,

      likes: 0,

      comments: [],

      pendingEdits: [],

      approvedEdits: [],
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error("POST ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});
app.put("/posts/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const user = await User.findById(req.user.id);

    if (post.userId.toString() !== req.user.id && user.role !== "admin") {
      return res.status(403).json({
        message: "You are not allowed to edit this post",
      });
    }

    post.text = req.body.text;

    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
app.delete("/posts/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    console.log("POST =", post);
    console.log("USERID =", post?.userId);
    console.log("TOKEN USER =", req.user.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const user = await User.findById(req.user.id);

    if (post.userId.toString() !== req.user.id && user.role !== "admin") {
      return res.status(403).json({
        message: "You are not allowed to delete this post",
      });
    }

    await post.deleteOne();

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
app.post("/posts/:id/comments", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const user = await User.findById(req.user.id);
    console.log(user);
    console.log("COMMENT AVATAR =", user.avatar);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.comments.push({
      username: user.username,
      avatar: user.avatar,
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
app.post(
  "/posts/:postId/comments/:commentId/replies",
  verifyToken,
  async (req, res) => {
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

      const user = await User.findById(req.user.id);

      comment.replies.push({
        username: user.username,
        avatar: user.avatar,
        text: req.body.text,
        likes: 0,
      });

      await post.save();

      res.status(201).json(comment.replies[comment.replies.length - 1]);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
);
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

    res.status(201).json(post.pendingEdits[post.pendingEdits.length - 1]);
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
app.patch(
  "/posts/:id/edit-request/:editId/approve",
  verifyToken,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({
          message: "Post not found",
        });
      }

      const user = await User.findById(req.user.id);

      if (post.userId.toString() !== req.user.id && user.role !== "admin") {
        return res.status(403).json({
          message: "You are not allowed to approve edits",
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
  },
);
app.delete("/posts/:id/edit-request/:editId", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }
    const user = await User.findById(req.user.id);

    if (post.userId.toString() !== req.user.id && user.role !== "admin") {
      return res.status(403).json({
        message: "You are not allowed to reject edits",
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
app.patch(
  "/users/avatar",
  verifyToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      user.avatar = req.file.path;

      await user.save();

      await Post.updateMany({ userId: user._id }, { avatar: user.avatar });

      res.json({
        message: "Avatar updated",
        avatar: user.avatar,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
);
app.patch("/users/username", verifyToken, async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.length < 3) {
      return res.status(400).json({
        message: "اسم المستخدم قصير",
      });
    }

    const exists = await User.findOne({ username });

    if (exists) {
      return res.status(400).json({
        message: "اسم المستخدم موجود",
      });
    }

    const user = await User.findById(req.user.id);

    user.username = username;

    await user.save();

    await Post.updateMany({ userId: user._id }, { username });

    res.json({
      username,
      message: "تم تغيير الاسم",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});
app.post("/google-login", async (req, res) => {
  try {
    const { idToken } = req.body;

    const decodedToken = await admin.auth.verifyIdToken(idToken);

    const { uid, email, name, picture } = decodedToken;

    let user = await User.findOne({ googleId: uid });

    if (!user) {
      user = await User.create({
        googleId: uid,
        username: name || email,
        email,
        avatar: picture,
        role: "user",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      token,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);

    res.status(401).json({
      message: "Google login failed",
      error: error.message,
    });
  }
});
const PORT = process.env.PORT || 5001;
async function checkImage(imageUrl) {
  try {
    const { data } = await axios.get(
      "https://api.sightengine.com/1.0/check.json",
      {
        params: {
          models: "nudity-2.1,gore-2.0",
          url: imageUrl,
          api_user: process.env.SIGHTENGINE_USER,
          api_secret: process.env.SIGHTENGINE_SECRET,
        },
      },
    );

    console.log("SIGHTENGINE RESULT:", data);

    return data;
  } catch (err) {
    console.log("SIGHTENGINE ERROR:");
    console.log(err.response?.data || err.message);
    throw err;
  }
}
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
