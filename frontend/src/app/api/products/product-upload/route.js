import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import cloudinary from "@/lib/cloudinary";
import { CreateServer } from "@/utils/db";
import { ProductTable, UserTable } from "@/model/auth.Schema";

export async function POST(req) {
  try {
    await CreateServer();

    const formData = await req.formData();
    const imageFiles = formData.getAll("images").filter(Boolean);

    const productName = formData.get("productName")?.toString().trim();
    const description = formData.get("description")?.toString().trim();
    const actualPrice = Number(formData.get("actualPrice"));
    const sellPrice = Number(formData.get("sellPrice"));
    const category = formData.get("category")?.toString().trim();
    const unit = formData.get("unit")?.toString().trim();
    const stock = Number(formData.get("stock"));
    const isAvailable = formData.get("isAvailable")?.toString() !== "false";

    if (!productName || !description || !category || !unit) {
      return NextResponse.json(
        { success: false, message: "Please fill all required fields" },
        { status: 400 }
      );
    }

    if (imageFiles.length < 1 || imageFiles.length > 3) {
      return NextResponse.json(
        { success: false, message: "Please upload between 1 and 3 images" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(actualPrice) || !Number.isFinite(sellPrice) || actualPrice <= 0 || sellPrice <= 0) {
      return NextResponse.json(
        { success: false, message: "Prices must be positive numbers" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(stock) || stock < 1) {
      return NextResponse.json(
        { success: false, message: "Stock must be at least one product" },
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
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (user.role !== "seller" || user.sellerStatus !== "approved") {
      return NextResponse.json(
        { success: false, message: "Only approved sellers can upload products" },
        { status: 403 },
      );
    }

    const uploadedImages = await Promise.all(
      imageFiles.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(base64, {
          folder: "kisan-bazar/products",
        });

        return result.secure_url;
      })
    );

    const product = await ProductTable.create({
      userId: user._id,
      productName,
      description,
      actualPrice,
      sellPrice,
      category,
      unit,
      imageUrls: uploadedImages,
      isAvailable,
      stock,
    });

    return NextResponse.json({
      success: true,
      message: "Product uploaded successfully",
      product,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Server error while uploading product" },
      { status: 500 }
    );
  }
}
