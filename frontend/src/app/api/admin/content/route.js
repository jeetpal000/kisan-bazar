import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { CreateServer } from "@/utils/db";
import { BlogTable, OrderTable, ProductTable } from "@/model/auth.Schema";

async function isAdmin() {
  const token = (await cookies()).get("accesstoken")?.value;
  try {
    return jwt.verify(token, process.env.SECRET_KEY)?.role === "admin";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    if (!(await isAdmin())) return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    await CreateServer();
    const [products, blogs, orders] = await Promise.all([
      ProductTable.find().populate("userId", "farmername email").sort({ createdAt: -1 }).lean(),
      BlogTable.find().populate("userId", "farmername email").sort({ createdAt: -1 }).lean(),
      OrderTable.find().populate("userId", "farmername email").populate("sellerId", "farmername email").sort({ createdAt: -1 }).lean(),
    ]);
    return NextResponse.json({ success: true, products, blogs, orders });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    await CreateServer();
    const { type, id } = await req.json();
    const tables = { product: ProductTable, blog: BlogTable, order: OrderTable };
    const table = tables[type];
    if (!table || !id) return NextResponse.json({ success: false, message: "Valid content type and id are required" }, { status: 400 });
    const existing = await table.findById(id);
    if (type === "order" && existing && !["Delivered", "Cancelled"].includes(existing.orderStatus)) {
      await ProductTable.findByIdAndUpdate(existing.productId, { $inc: { stock: existing.quantity } });
    }
    const deleted = await table.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: "Content not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: `${type} deleted successfully` });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
