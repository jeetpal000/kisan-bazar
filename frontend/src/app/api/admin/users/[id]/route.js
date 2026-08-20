import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { CreateServer } from "@/utils/db";
import {
  BlogTable,
  CartTable,
  OrderTable,
  ProductTable,
  SessionTable,
  UserTable,
  WishlistTable,
} from "@/model/auth.Schema";

async function isAdmin() {
  const token = (await cookies()).get("accesstoken")?.value;
  try {
    return jwt.verify(token, process.env.SECRET_KEY)?.role === "admin";
  } catch {
    return false;
  }
}

export async function DELETE(req, { params }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    }
    await CreateServer();
    const { id } = await params;
    const user = await UserTable.findByIdAndDelete(id);
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    await Promise.all([
      BlogTable.deleteMany({ userId: id }),
      ProductTable.deleteMany({ userId: id }),
      OrderTable.deleteMany({ $or: [{ userId: id }, { sellerId: id }] }),
      CartTable.deleteMany({ userId: id }),
      WishlistTable.deleteMany({ userId: id }),
      SessionTable.deleteMany({ userId: id }),
    ]);

    return NextResponse.json({ success: true, message: "User and related content deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
