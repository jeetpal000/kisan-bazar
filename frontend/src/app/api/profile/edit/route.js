import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { CreateServer } from "@/utils/db";
import { UserTable } from "@/model/auth.Schema";

export async function PUT(req) {
  try {
    await CreateServer();
    const token = (await cookies()).get("accesstoken")?.value;
    const decoded = token && jwt.verify(token, process.env.SECRET_KEY);

    if (!decoded?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { farmername, phone } = await req.json();
    if (!farmername?.trim() || !/^[0-9]{10}$/.test(phone || "")) {
      return NextResponse.json(
        { success: false, message: "Name and a valid 10 digit phone are required" },
        { status: 400 },
      );
    }

    const user = await UserTable.findByIdAndUpdate(
      decoded.id,
      { $set: { farmername: farmername.trim(), phone } },
      { new: true },
    ).lean();

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        farmername: user.farmername,
        email: user.email,
        phone: user.phone,
        role: user.role,
        sellerStatus: user.sellerStatus,
        sellerProfile: user.sellerProfile,
        profileImage: user.profileImage,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
