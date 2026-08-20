import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import cloudinary from "@/lib/cloudinary";
import { ProductTable, UserTable } from "@/model/auth.Schema";
import { CreateServer } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await CreateServer();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const product = await ProductTable.findById(id).populate(
      "userId",
      "farmername"
    );

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while fetching product details",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await CreateServer();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const existingImageUrls = formData
      .getAll("existingImageUrls")
      .filter(Boolean)
      .map((value) => value.toString());
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
        {
          success: false,
          message: "Please fill all required fields",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(actualPrice) || !Number.isFinite(sellPrice) || actualPrice <= 0 || sellPrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Prices must be positive numbers",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(stock) || stock < 1) {
      return NextResponse.json(
        { success: false, message: "Stock must be at least one product" },
        { status: 400 }
      );
    }

    const totalImages = existingImageUrls.length + imageFiles.length;
    if (totalImages < 1 || totalImages > 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Please keep between 1 and 3 images",
        },
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

    if (user.role !== "seller" || user.sellerStatus !== "approved") {
      return NextResponse.json(
        { success: false, message: "Only approved sellers can edit products" },
        { status: 403 },
      );
    }

    const currentProduct = await ProductTable.findById(id);
    if (!currentProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    if (currentProduct.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to edit this product" },
        { status: 403 }
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

    const finalImageUrls = [...existingImageUrls, ...uploadedImages];

    const updatedProduct = await ProductTable.findByIdAndUpdate(
      id,
      {
        productName,
        description,
        actualPrice,
        sellPrice,
        category,
        unit,
        stock,
        imageUrls: finalImageUrls,
        isAvailable,
      },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while updating product",
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
        { success: false, message: "Product ID is required" },
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

    if (user.role !== "seller" || user.sellerStatus !== "approved") {
      return NextResponse.json(
        { success: false, message: "Only approved sellers can delete products" },
        { status: 403 },
      );
    }

    const currentProduct = await ProductTable.findById(id);
    if (!currentProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    if (currentProduct.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "You are not authorized to edit this product" },
        { status: 403 }
      );
    }

    await ProductTable.deleteOne({ _id: id });



    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while deleting product",
      },
      { status: 500 }
    );
  }
}