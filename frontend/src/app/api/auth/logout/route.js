import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { CreateServer } from "@/utils/db";
import { SessionTable } from "@/model/auth.Schema";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accesstoken")?.value;

    if (token) {
      const data = jwt.verify(token, process.env.SECRET_KEY);

      await CreateServer();
      await SessionTable.deleteMany({ userId: data.id });
    }

    cookieStore.delete("accesstoken");

    return NextResponse.json(
      {
        status: "SUCCESS",
        message: "Logout successful",
        redirect: "/login",
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
      },
      { status: 500 }
    );
  }
}