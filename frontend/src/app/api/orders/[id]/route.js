import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { CreateServer } from "@/utils/db";
import { OrderTable, ProductTable, UserTable } from "@/model/auth.Schema";

const orderStatuses = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export async function PATCH(req, { params }) {
  try {
    await CreateServer();
    const { id } = await params;
    const token = (await cookies()).get("accesstoken")?.value;
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const seller = await UserTable.findById(decoded.id).lean();
    if (seller?.role !== "seller" || seller.sellerStatus !== "approved") {
      return NextResponse.json({ success: false, message: "Approved seller access required" }, { status: 403 });
    }

    const { status } = await req.json();
    if (!orderStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid order status" }, { status: 400 });
    }

    const existingOrder = await OrderTable.findOne({
      _id: id,
      sellerId: decoded.id,
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found or you are not its seller" },
        { status: 404 },
      );
    }

    if (existingOrder.orderStatus === "Delivered" || existingOrder.orderStatus === "Cancelled") {
      return NextResponse.json(
        { success: false, message: "This order can no longer be updated" },
        { status: 400 },
      );
    }

    if (status === "Cancelled") {
      const product = await ProductTable.findOneAndUpdate(
        { _id: existingOrder.productId },
        { $inc: { stock: existingOrder.quantity } },
        { new: true },
      );

      if (!product) {
        return NextResponse.json(
          { success: false, message: "Product not found; order was not cancelled" },
          { status: 404 },
        );
      }
    }

    const order = await OrderTable.findByIdAndUpdate(
      existingOrder._id,
      {
        $set: {
          orderStatus: status,
          ...(status === "Cancelled" ? { stockRestored: true } : {}),
        },
      },
      { new: true },
    ).lean();

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to update order" }, { status: 500 });
  }
}
