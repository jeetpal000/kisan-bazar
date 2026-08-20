import { CreateServer } from "@/utils/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import cloudinary from "@/lib/cloudinary";
import { BlogTable, UserTable } from "@/model/auth.Schema";

export async function GET(req, { params }) {
  try {
    await CreateServer();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Blog ID is required" },
        { status: 400 }
      );
    }

    const blog = await BlogTable.findById(id).populate("userId", "farmername");

    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      blog,
    }, { status: 200 });
  } catch (error) {
    console.error("Blog fetch error:", error);
    return NextResponse.json({
      success: false,
      message: "Server error while fetching blog",
    }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await CreateServer();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Blog ID is required" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const existingMedia = formData
      .getAll("existingMedia")
      .filter(Boolean)
      .map((value) => {
        try {
          return JSON.parse(value.toString());
        } catch {
          return null;
        }
      })
      .filter(Boolean);
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

    const totalMedia = existingMedia.length + mediaFiles.length;
    if (totalMedia < 1 || totalMedia > 3) {
      return NextResponse.json(
        { success: false, message: "Please keep between 1 and 3 media items" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("accesstoken")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await UserTable.findOne({ email: decoded.email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const currentBlog = await BlogTable.findById(id);
    if (!currentBlog) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    if (currentBlog.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to edit this blog" },
        { status: 403 }
      );
    }

    const uploadedMedia = await Promise.all(
      mediaFiles.map(async (file, index) => {
        const isVideo = mediaTypes[index] === "video";
        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        const maxSizeMB = isVideo ? 100 : 10;

        if (file.size > maxSize) {
          throw new Error(
            `${isVideo ? "Video" : "Image"} size should not exceed ${maxSizeMB}MB.`
          );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

        const uploadResult = await cloudinary.uploader.upload(base64, {
          folder: "kisan-bazar/blogs",
          resource_type: "auto",
          timeout: 120000,
        });

        return {
          url: uploadResult.secure_url,
          type: isVideo ? "video" : "image",
        };
      })
    );

    const finalMedia = [...existingMedia, ...uploadedMedia];

    const updatedBlog = await BlogTable.findByIdAndUpdate(
      id,
      {
        blogName,
        description,
        category,
        mediaUrls: finalMedia,
      },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Blog updated successfully",
        blog: updatedBlog,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Blog update error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error while updating blog",
      },
      { status: 500 }
    );
  }
}


export async function POST(req, { params }) {
  try {
    await CreateServer();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Blog ID is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("accesstoken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await UserTable.findOne({ email: decoded.email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const currentProduct = await BlogTable.findById(id);
    if (!currentProduct) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    if (currentProduct.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to edit this product" },
        { status: 403 }
      );
    }

    await BlogTable.deleteOne({ _id: id });



    return NextResponse.json(
      {
        success: true,
        message: "Blog deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Blog update error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while deleting product",
      },
      { status: 500 }
    );
  }
}
