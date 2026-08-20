import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { CreateServer } from "@/utils/db";
import { BlogTable, UserTable } from "@/model/auth.Schema";


export async function GET() {
  try {
    await CreateServer();

    const cookieStore = await cookies();
    const token = cookieStore.get("accesstoken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const user = await UserTable.findOne({ email: decoded.email }).lean();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const myBlogs = await BlogTable.find({ userId: user._id }).lean();

    return NextResponse.json({ success: true, blogs: myBlogs });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error while fetching products" },
      { status: 500 }
    );
  }
}