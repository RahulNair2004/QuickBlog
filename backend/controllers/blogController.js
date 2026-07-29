import imagekit from "../config/imageKit.js";
import Blog from "../models/Blog.js";
import fs from "fs";
import Comment from "../models/Comment.js";
import main from "../config/ollama.js";

//add a new blog post
export const addBlog = async (req, res) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);
    const { title, subTitle, description, category, isPublished } = JSON.parse(
      req.body.blog
    );
    const imageFile = req.file;

    if (!title || !description || !category || !imageFile) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //uploading image to image kit
    const fileBuffer = fs.readFileSync(imageFile.path);
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogs",
    });

    //optimization through imagekit URL transformation
    const optimizedImageUrl = imagekit.url({
      path: response.filePath,
      transformation: [
        { quality: "auto" }, //auto compression
        { format: "webp" }, //conver to modern format
        { width: "1280" }, //width resize
      ],
    });

    const image = optimizedImageUrl;

    await Blog.create({
      title,
      subTitle,
      description,
      category,
      image,
      isPublished,
    });

    res.status(200).json({
      success: true,
      message: "Blog added successsfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error occured while creating blog",
    });
  }
};

//get the list of blogs

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true });
    if (!blogs) {
      return res.status(404).json({
        success: false,
        message: "No blogs found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "All blogs fetched successfully",
      blogs,
    });
  } catch (error) {
    console.log("Unable to fetch all blogs", error);
    return res.status(400).json({
      success: false,
      message: "Error occured while fetching all blogs, please try again later",
    });
  }
};

//get the individual blog data

export const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;
    console.log("This is the blog id", blogId);
    if (!blogId) {
      return res.status(404).json({
        success: false,
        message: "blogId is required",
      });
    }
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Blog found successfully",
      blog,
    });
  } catch (error) {
    console.log("Error occured while fetching a single blog", error);
    return res.status(500).json({
      success: false,
      message: "Could not found blog by this id, please try again later",
    });
  }
};

//delete any blog

export const deleteBlogById = async (req, res) => {
  try {
    const { Id } = req.body;
    if (!Id) {
      return res.status(404).json({
        success: false,
        message: "blogId is required",
      });
    }
    await Blog.findByIdAndDelete(Id);
    //deleteing all comments assotiated with this blog
    await Comment.deleteMany({ blog: Id });
    return res.status(200).json({
      success: true,
      message: "Blog Deleted successfully",
    });
  } catch (error) {
    console.log("Error occured while deleting a single blog", error);
    return res.status(500).json({
      success: false,
      message: "Could not delete blog by this id, please try again later",
    });
  }
};

//publish or unpublish any blog

export const togglePublish = async (req, res) => {
  try {
    const { Id } = req.body;
    console.log("Toggling publish for blog ID:", Id);

    const blog = await Blog.findById(Id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found with the provided ID",
      });
    }
    blog.isPublished = !blog.isPublished;
    await blog.save();
    return res.status(200).json({
      success: true,
      message: "Blog status updated successfully",
    });
  } catch (error) {
    console.log("error occured while toggling publish", error);
    return res.status(500).json({
      success: false,
      message: "Could not toggle blog publish, please try again later",
    });
  }
};

//addcomment controller

export const addComment = async (req, res) => {
  try {
    const { blog, name, content } = req.body;
    await Comment.create({ blog, name, content });
    return res.status(200).json({
      success: true,
      message: "Comment added for review",
    });
  } catch (error) {
    console.log("Error occured while adding comment", error);
    return res.status(500).json({
      success: false,
      message: "Could add comment, please try again later",
    });
  }
};

//get Comments for individual blog controller
export const getBlogCommets = async (req, res) => {
  try {
    const { Id } = req.body;
    const comments = await Comment.find({
      blog: Id,
      isApproved: true,
    }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.log("Error occured while getting individual comment", error);
    return res.status(500).json({
      success: false,
      message: "Could get individual comment, please try again later",
    });
  }
};

//generate content

export const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;
    const content = await main(
      prompt + " Generate a blog content for this topic in simple text foemat"
    );
    res.status(200).json({
      success: true,
      content,
    });
  } catch (error) {
    console.log("Error occured while generating content", error);
    res.status(400).json({
      success: false,
      message: "Error occured while generating content",
    });
  }
};