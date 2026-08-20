import { UserTable } from "@/model/auth.Schema";
import { CreateServer } from "@/utils/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function PUT(req, { params }) {
  try {
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

    if (decoded?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden: admin access required" },
        { status: 403 }
      );
    }

    await CreateServer();

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const approved = body.action !== "revoke";

    const updatedUser = await UserTable.findByIdAndUpdate(
      id,
      {
        sellerStatus: approved ? "approved" : "rejected",
        role: approved ? "seller" : "user",
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}