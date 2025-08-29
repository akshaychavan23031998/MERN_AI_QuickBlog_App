import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Blog from "../models/Blog.js";
import Comment from "../models/Comments.js";
import main from "../configs/gemini.js";

export const addBlog = async (req, res) => {
  try {
    // 1) Parse JSON payload sent as a text field named "blog"
    let payload;
    try {
      payload = JSON.parse(req.body.blog || "{}");
    } catch {
      return res
        .status(400)
        .json({ success: false, message: "Invalid blog JSON" });
    }

    const { title, subTitle, description, category, isPublished } = payload;
    const imageFile = req.file;

    // 2) Validate required fields
    if (!title || !description || !category) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    if (typeof isPublished !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "isPublished must be boolean" });
    }
    if (!imageFile) {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    // 3) Read file buffer (works for disk or memory storage)
    const fileBuffer = imageFile.buffer ?? fs.readFileSync(imageFile.path);

    // 4) Upload to ImageKit
    const uploadResp = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogs",
    });

    // 5) Build optimized URL (fix 'format' spelling)
    const optimizedImageUrl = imagekit.url({
      path: uploadResp.filePath,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: 1280 },
      ],
    });

    // 6) Save blog
    const blogDoc = await Blog.create({
      title,
      subTitle,
      description,
      category,
      image: optimizedImageUrl,
      isPublished,
    });

    // 7) Respond
    return res.status(201).json({
      success: true,
      message: "Blog Added Successfully",
      data: blogDoc,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true });
    res.json({ success: true, message: "All Blogs", blogs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res
        .status(500)
        .json({ success: false, message: "Blog Not Found" });
    }
    res.json({ success: true, message: "Single Blog (Blog By ID)", blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBlogById = async (req, res) => {
  try {
    const { id } = req.body;
    await Blog.findByIdAndDelete(id);

    // delete all comments associated with this blog
    await Comment.deleteMany({ blog: id });

    res.json({ success: true, message: "Blog deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const togglePublish = async (req, res) => {
  try {
    const { id } = req.body;
    const blog = await Blog.findById(id);
    blog.isPublished = !blog.isPublished;
    await blog.save();
    res.json({ success: true, message: "Blog Status Updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { blog, name, content } = req.body;
    await Comment.create({ blog, name, content });
    return res
      .status(200)
      .json({ success: true, message: "Comment added for review" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.body;
    const comments = await Comment.find({
      blog: blogId,
      isApproved: true,
    }).sort({ createdAt: -1 });
    res.json({ success: true, comments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;
    const content = await main(
      prompt + " Generate a blog content for this topic in simple text formate"
    );
    res.json({ success: true, content });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
