import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { CreateServer } from "@/utils/db";
import { OrderTable, ProductTable, UserTable } from "@/model/auth.Schema";
import { sendEmail } from "@/lib/nodemailer";

function getTokenUser(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.SECRET_KEY);
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    await CreateServer();

    const token = (await cookies()).get("accesstoken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const decoded = getTokenUser(token);
    if (!decoded?.id) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const { productId, quantity } = await req.json();

    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Product and quantity required",
        },
        {
          status: 400,
        },
      );
    }

    const product = await ProductTable.findById(productId);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        {
          status: 404,
        },
      );
    }

    if (!product.isAvailable) {
      return NextResponse.json(
        {
          success: false,
          message: "Product unavailable",
        },
        {
          status: 400,
        },
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient stock",
        },
        {
          status: 400,
        },
      );
    }

    const buyer = await UserTable.findById(decoded.id).lean();
    if (!buyer?.addresses?.address) {
      return NextResponse.json(
        { success: false, message: "Please add a delivery address first" },
        { status: 400 },
      );
    }

    const reservedProduct = await ProductTable.findOneAndUpdate(
      { _id: productId, isAvailable: true, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true },
    );

    if (!reservedProduct) {
      return NextResponse.json(
        { success: false, message: "Product stock is no longer available" },
        { status: 409 },
      );
    }

    const unitPrice = product.sellPrice;

    const totalPrice = unitPrice * quantity;

    const order = await OrderTable.create({
      userId: decoded.id,

      sellerId: product.userId,

      productId: product._id,

      productName: product.productName,

      productImage: product.imageUrls?.[0] || "",

      quantity,

      unitPrice,

      totalPrice,

      paymentMethod: "COD",

      shippingAddress: buyer.addresses,
    });

    const seller = await UserTable.findById(product.userId).lean();
    const productUrl = `${new URL(req.url).origin}/shopping/${product._id}`;

    try {
      const emailDetails = `
          <h2>Order confirmed</h2>
          <p><strong>Product:</strong> ${product.productName}</p>
          <p><strong>Quantity:</strong> ${quantity}</p>
          <p><strong>Total:</strong> ₹${totalPrice.toLocaleString("en-IN")}</p>
          <p><strong>Product link:</strong> <a href="${productUrl}">${productUrl}</a></p>
        `;

      const emailJobs = [
        sendEmail({
          to: buyer.email,
          subject: `Order confirmed: ${product.productName}`,
          html: `${emailDetails}<p>Thank you, ${buyer.farmername}. Your cash on delivery order has been placed.</p><p>You can track this order from your My Orders page.</p>`,
        }),
      ];

      if (seller?.email && seller.email !== buyer.email) {
        emailJobs.push(
          sendEmail({
            to: seller.email,
            subject: `New order received: ${product.productName}`,
            html: `${emailDetails}<h3>Buyer contact details</h3><p><strong>Name:</strong> ${buyer.farmername}</p><p><strong>Email:</strong> ${buyer.email}</p><p><strong>Phone:</strong> ${buyer.phone}</p><p><strong>Delivery address:</strong> ${buyer.addresses.address}, ${buyer.addresses.city}, ${buyer.addresses.state} - ${buyer.addresses.pincode}</p>`,
          }),
        );
      }

      const emailResults = await Promise.allSettled(emailJobs);
      emailResults
        .filter((result) => result.status === "rejected")
        .forEach((result) => console.error("Order notification failed", result.reason));
    } catch (emailError) {
      console.error("Order created but confirmation email failed", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET() {
  try {
    await CreateServer();
    const token = (await cookies()).get("accesstoken")?.value;
    const decoded = getTokenUser(token);

    if (!decoded?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const orders = await OrderTable.find({ userId: decoded.id })
      .sort({ createdAt: -1 })
      .populate("sellerId", "farmername sellerProfile.shopname")
      .lean();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to load orders" }, { status: 500 });
  }
}