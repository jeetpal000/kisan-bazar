import { NextResponse } from "next/server";
import { CreateServer } from "@/utils/db";
import { UserTable, WishlistTable } from "@/model/auth.Schema";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req) {

  try {
    await CreateServer();

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

    const { productId } = await req.json();

    const existingItem = await WishlistTable.findOne({
      userId: user._id,
      productId,
    });

    if (existingItem) {
      await WishlistTable.findOneAndDelete({
        userId: user._id,
        productId
      });
      return NextResponse.json({
        success: true,
      });
    }

    const wishlist = await WishlistTable.create({
      userId: user._id,
      productId,
    });

    return NextResponse.json({
      success: true,
      wishlist,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    await CreateServer();

    const token = (await cookies()).get("accesstoken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          wishlist: [],
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const wishlist = await WishlistTable.find({
      userId: decoded.id,
    })
      .populate("productId")
      .sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      wishlist,
      totalItems: wishlist.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await CreateServer();

    const token = (await cookies()).get("accesstoken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const productId = new URL(req.url).searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product id is required" },
        { status: 400 },
      );
    }

    const deletedItem = await WishlistTable.findOneAndDelete({
      userId: decoded.id,
      productId,
    });

    if (!deletedItem) {
      return NextResponse.json(
        { success: false, message: "Wishlist item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}