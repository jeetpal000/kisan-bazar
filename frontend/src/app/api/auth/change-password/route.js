import { NextResponse } from "next/server";
import { CreateServer } from "../../../../utils/db";
import { UserTable } from "../../../../model/auth.Schema";
import argon2 from "argon2";
import { createSessionSetCookies } from "../../../../../feature/session";
import "dotenv/config";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await CreateServer();
    const body = await req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json({
        status: "ERROR",
        message: "Old and New password are required"
      }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("accesstoken")?.value;

    const decode = jwt.verify(token, process.env.SECRET_KEY);


    const user = await UserTable.findOne({ email: decode.email });

    // checking user exist or not 
    if (!user) {
      return NextResponse.json({
        status: "ERROR",
        message: "Invalid user"
      }, { status: 401 });
    }

    const verifyPassword = await argon2.verify(user.password, oldPassword);

    if (!verifyPassword) {
      return NextResponse.json({
        status: "ERROR",
        message: "Old Password not matched"
      }, { status: 401 });
    }

    const hashedPassword = await argon2.hash(newPassword);

    await UserTable.findByIdAndUpdate(user._id, {
      password: hashedPassword
    }
    )



    return NextResponse.json({
      status: "SUCCESS",
      message: "Password Changed successfully",
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({

    }, { status: 500 })
  }
}




