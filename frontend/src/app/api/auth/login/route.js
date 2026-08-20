import { NextResponse } from "next/server";
import { CreateServer } from "../../../../utils/db";
import { UserTable } from "../../../../model/auth.Schema";
import argon2 from "argon2";
import { createSessionSetCookies } from "../../../../../feature/session";


export async function POST(req) {
  try {
    await CreateServer();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({
        status: "ERROR",
        message: "Email and password are required"
      }, { status: 400 });
    }

    const user = await UserTable.findOne({ email });

    // checking user exist or not 
    if (!user) {
      return NextResponse.json({
        status: "ERROR",
        message: "Invalid email or password"
      }, { status: 401 });
    }

    const verifyPassword = await argon2.verify(user.password, password);

    if (!verifyPassword) {
      return NextResponse.json({
        status: "ERROR",
        message: "Invalid email or password"
      }, { status: 401 });
    }

    await createSessionSetCookies({ id: user._id, name: user.farmername, email: user.email, phone: user.phone, role: user.role });

    return NextResponse.json({
      status: "SUCCESS",
      message: "Login completed successfully",
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({

    }, { status: 500 })
  }
}




