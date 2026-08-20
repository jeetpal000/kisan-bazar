import { UserTable } from "@/model/auth.Schema";
import { CreateServer } from "@/utils/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    await CreateServer();

    const token = (await cookies()).get("accesstoken")?.value;
    const decoded = token && jwt.verify(token, process.env.SECRET_KEY);

    if (decoded?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 },
      );
    }

    const users = await UserTable.find();

    return NextResponse.json({
      success: true,
      users: users,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}