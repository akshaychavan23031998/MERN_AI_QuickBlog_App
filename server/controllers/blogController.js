// import fs from "fs";
// import imagekit from "../configs/imageKit.js";
// import Blog from "../models/Blog.js";

// export const addBlog = async (req, res) => {
//   try {
//     const { title, subTitle, description, category, isPublished } = JSON.parse(
//       req.body.blog
//     );
//     const imageFile = req.file;

//     // check if all fileds are present
//     if (!title || !description || !category || !isPublished) {
//       return res.json({
//         success: false,
//         message: "Missing Fileds are required",
//       });

//     //   const fileBuffer = fs.readFileSync(imageFile.path);
//       const fileBuffer = imageFile.buffer ?? fs.readFileSync(imageFile.path);

//       // Upload Image to ImageKit
//       const response = await imagekit.upload({
//         file: fileBuffer,
//         fileName: imageFile.originalname,
//         folder: "/blogs",
//       });

//       //   Optimization through imageKit url transformation
//       const optimizedImageUrl = imagekit.url({
//         path: response.filePath,
//         transformation: [
//           { quality: "auto" }, // Auto compression
//           { formate: "webp" }, // convert to modern formate
//           { width: "1280" }, // width resizing
//         ],
//       });

//       const image = optimizedImageUrl;

//       const Blog_Data = await Blog.create({
//         title,
//         subTitle,
//         description,
//         category,
//         image,
//         isPublished,
//       });

//       res.json({
//         success: true,
//         message: "Blog Added Successfully",
//         data: Blog_Data,
//       });
//     }
//   } catch (error) {
//     res.json({ success: false, message: error.message, data: Blog_Data });
//   }
// };

// server/controllers/blogController.js
import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Blog from "../models/Blog.js";

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
