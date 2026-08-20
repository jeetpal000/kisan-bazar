import { CreateServer } from "@/utils/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken"
import cloudinary from "@/lib/cloudinary";
import { BlogTable, UserTable } from "@/model/auth.Schema";

// Set request timeout to 5 minutes
export const maxDuration = 300;

// Maximum file sizes in bytes
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

export async function POST(req) {
  try {
    await CreateServer();

    const formData = await req.formData();
    const mediaFiles = formData.getAll("media").filter(Boolean);
    const mediaTypes = formData.getAll("mediaType").filter(Boolean);

    const blogName = formData.get("blogName")?.toString().trim();
    const description = formData.get("description")?.toString().trim();
    const category = formData.get("category")?.toString().trim();

    if (!blogName || !description || !category) {
      return NextResponse.json(
        { success: false, message: "Please fill all required fields" },
        { status: 400 }
      );
    }

    if (mediaFiles.length < 1 || mediaFiles.length > 3) {
      return NextResponse.json(
        { success: false, message: "Please upload between 1 and 3 media items" },
        { status: 400 }
      )
    }

    // Validate file sizes
    for (let i = 0; i < mediaFiles.length; i++) {
      const file = mediaFiles[i];
      const isVideo = mediaTypes[i] === "video";
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

      if (file.size > maxSize) {
        const maxSizeMB = isVideo ? 100 : 10;
        return NextResponse.json(
          { success: false, message: `${isVideo ? "Video" : "Image"} size should not exceed ${maxSizeMB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB` },
          { status: 400 }
        );
      }
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("accesstoken")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY);
    const user = await UserTable.findOne({ email: decode.email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    const uploadedMedia = await Promise.all(
      mediaFiles.map(async (file, index) => {
        try {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

          console.log(`Uploading media ${index + 1} (${(file.size / (1024 * 1024)).toFixed(2)}MB)...`);

          const uploadResult = await cloudinary.uploader.upload(base64, {
            folder: "kisan-bazar/blogs",
            resource_type: "auto",
            timeout: 120000, // 2 minutes for individual upload
          });

          console.log(`Media ${index + 1} uploaded successfully`);

          return {
            url: uploadResult.secure_url,
            type: mediaTypes[index] === "video" ? "video" : "image"
          }
        } catch (uploadError) {
          console.error(`Error uploading file ${index + 1}:`, uploadError);
          throw new Error(`Failed to upload ${mediaTypes[index]}: ${uploadError.message}`);
        }
      })
    );

    const blog = await BlogTable.create({
      userId: user._id,
      blogName,
      description,
      category,
      mediaUrls: uploadedMedia,
    });
    return NextResponse.json({
      success: true,
      message: "Blog uploaded successfully",
      blog
    },
      { status: 201 }
    );

  } catch (error) {
    console.error("Blog upload error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Server error while uploading blog"
    }, { status: 500 });
  }
}