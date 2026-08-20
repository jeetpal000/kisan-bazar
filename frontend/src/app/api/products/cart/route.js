import { NextResponse } from "next/server";
import { CreateServer } from "@/utils/db";
import { CartTable, ProductTable, UserTable } from "@/model/auth.Schema";
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

    const { productId, quantity = 1 } = await req.json();

    if (!productId || !Number.isInteger(quantity) || quantity === 0) {
      return NextResponse.json(
        { success: false, message: "Product and valid quantity required" },
        { status: 400 },
      );
    }

    const product = await ProductTable.findById(productId);

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    if (!product.isAvailable || product.stock < 1) {
      return NextResponse.json({ success: false, message: "Product is out of stock" }, { status: 400 });
    }

    const existingItem = await CartTable.findOne({
      userId: user._id,
      productId,
    });

    if (existingItem) {
      const nextQuantity = existingItem.quantity + quantity;

      if (nextQuantity < 1) {
        return NextResponse.json(
          { success: false, message: "Cart quantity cannot be less than one" },
          { status: 400 },
        );
      }

      if (nextQuantity > product.stock) {
        return NextResponse.json(
          { success: false, message: `Only ${product.stock} item(s) available` },
          { status: 400 },
        );
      }

      existingItem.quantity = nextQuantity;
      await existingItem.save();

      return NextResponse.json({
        success: true,
        cart: existingItem,
      });
    }

    if (quantity < 1 || quantity > product.stock) {
      return NextResponse.json(
        { success: false, message: `Only ${product.stock} item(s) available` },
        { status: 400 },
      );
    }

    const cart = await CartTable.create({
      userId: user._id,
      productId,
      quantity,
    });

    return NextResponse.json({
      success: true,
      cart,
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

    // Cookie se token nikalo
    const token = (await cookies()).get("accesstoken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          cart: [],
        },
        { status: 401 }
      );
    }

    // Token verify
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // User ka cart lao
    const cart = await CartTable.find({
      userId: decoded.id,
    })
      .populate("productId")
      .sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      cart,
      totalItems: cart.length,
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
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get("productId");

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

  const deletedItem = await CartTable.findOneAndDelete({
    userId: decoded.id,
    productId,
  });
  if (!deletedItem) {
    return NextResponse.json(
      {
        success: false,
        message: "Cart item not found",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Product Remove successfully"
  });
}