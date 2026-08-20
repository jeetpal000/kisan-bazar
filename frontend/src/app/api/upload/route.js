import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import cloudinary from "@/lib/cloudinary";
import { CreateServer } from "@/utils/db";
import { SessionTable, UserTable } from "@/model/auth.Schema";

const verifyJWTToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return null;
  }
};

export async function POST(req) {
  await CreateServer();
  const body = await req.json();

  const cookieStore = await cookies();
  const token = cookieStore.get("accesstoken")?.value;
  const decodedToken = verifyJWTToken(token);

  if (!decodedToken) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const session = await SessionTable.findOne({ token }).populate("userId").lean();
  if (!session || !session.userId) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const result = await cloudinary.uploader.upload(body.image);

  console.log(result.secure_url);

  const updatedUser = await UserTable.findByIdAndUpdate(
    session.userId._id,
    { profileImage: result.secure_url },
    { new: true }
  ).lean();

  return NextResponse.json({
    success: true,
    url: result.secure_url,
    user: {
      id: updatedUser._id,
      farmername: updatedUser.farmername,
      phone: updatedUser.phone,
      email: updatedUser.email,
      sellerStatus: updatedUser.sellerStatus,
      sellerProfile: updatedUser.sellerProfile,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
    },
  });
}