import { v2 as cloudinary } from "cloudinary";
import Blog from  "../models/BlogModel.js"

// ── Cloudinary helper (same pattern as studentController) ──────
const uploadToCloudinary = (buffer) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "blog_images" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });
};

// ─────────────────────────────────────────────────────────────
// GET /api/blog  — public, returns all posts newest first
// ─────────────────────────────────────────────────────────────
export const getAllPosts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== "All" ? { category } : {};
    const posts = await Blog.find(filter).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/blog/:id  — public, single post
// ─────────────────────────────────────────────────────────────
export const getPostById = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/blog  — admin or teacher
// multipart/form-data: image file + { title, category, date, href }
// ─────────────────────────────────────────────────────────────
export const createPost = async (req, res) => {
  try {
    const { title, category, date, href } = req.body;

    if (!title?.trim() || !category?.trim() || !date?.trim()) {
      return res.status(400).json({ message: "Title, category, and date are required" });
    }

    // Cloudinary upload if a file was sent
    let imageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    // Detect who is creating (req.admin = super admin, req.user = teacher)
    const createdBy = req.admin
      ? { id: req.admin._id, role: "admin" }
      : { id: req.user._id,  role: req.user.role };

    const author = req.admin ? req.admin.name : req.user?.name ?? "Royal Gem Schools";

    const post = await Blog.create({
      title:    title.trim(),
      category: category.trim(),
      date:     date.trim(),
      href:     href?.trim() ?? "",
      image:    imageUrl,
      author,
      createdBy,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/blog/:id  — admin or teacher (owner or admin)
// ─────────────────────────────────────────────────────────────
export const updatePost = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const allowed = ["title", "category", "date", "href"];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) post[key] = req.body[key];
    });

    // Replace image if a new file was uploaded
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      post.image = result.secure_url;
    }

    const updated = await post.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/blog/:id  — admin or teacher
// ─────────────────────────────────────────────────────────────
export const deletePost = async (req, res) => {
  try {
    const post = await Blog.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
