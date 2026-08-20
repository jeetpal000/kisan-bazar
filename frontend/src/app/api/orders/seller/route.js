import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { CreateServer } from "@/utils/db";
import { OrderTable, UserTable } from "@/model/auth.Schema";

export async function GET() {
  try {
    await CreateServer();
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

    const orders = await OrderTable.find({ sellerId: decoded.id })
      .sort({ createdAt: -1 })
      .populate("userId", "farmername email phone")
      .lean();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to load seller orders" }, { status: 500 });
  }
}
