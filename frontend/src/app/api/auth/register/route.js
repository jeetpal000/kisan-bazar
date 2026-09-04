import { NextResponse } from "next/server";
import { CreateServer } from "../../../../utils/db";
import { UserTable } from "../../../../model/auth.Schema";
import argon2 from "argon2";
import { createSessionSetCookies } from "../../../../../feature/session";

export async function POST(req) {
  try {
    await CreateServer();
    const body = await req.json();
    const { farmername, email, phone, password } = body;
    if (!email || !password || !farmername) {
      return NextResponse.json({
        status: "ERROR",
        message: "Email, password, and farmer name are required"
      }, { status: 400 });
    }
    const user = await UserTable.findOne({ email });

    // checking user exist or not 
    if (user?.email === email) {
      return NextResponse.json({
        status: "ERROR",
        message: "This email already exist"
      })
    }

    // const hashedPassword = await argon2.hash(password);

    const newUser = await UserTable.create({
      farmername,
      email,
      phone,
      password: hashedPassword,
    });

    await createSessionSetCookies({ id: newUser._id, name: newUser.farmername, email: newUser.email, phone: newUser.phone, role: newUser.role })

    return NextResponse.json({
      status: "SUCCESS",
      message: "Registration completed successfully"
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: "ERROR",
      message: "Unknown Error occurred! Please try again"
    }, { status: 500 })
  }
}

