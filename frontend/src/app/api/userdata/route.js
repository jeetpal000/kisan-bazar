import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { SessionTable, UserTable } from "@/model/auth.Schema";
import { CreateServer } from "@/utils/db";

const verifyJWTToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return null;
  }
};

export async function GET() {
  await CreateServer();
  const cookieStore = await cookies();
  const token = cookieStore.get("accesstoken")?.value;
  const decodedToken = verifyJWTToken(token);

  if (!decodedToken) {
    cookieStore.delete("accesstoken");
    return NextResponse.json({ user: null });
  }

  const session = await SessionTable.findOne({ token }).populate("userId").lean();
  if (!session || !session.userId) {
    cookieStore.delete("accesstoken");
    return NextResponse.json({ user: null });
  }

  const { farmername, phone, email, sellerStatus, sellerProfile, addresses, role, profileImage } = session.userId;
  return NextResponse.json({
    user: {
      id: session.userId._id.toString(),
      farmername,
      phone,
      email,
      sellerStatus,
      sellerProfile,
      role,
      profileImage,
      addresses,
    },
  });
}


export async function PUT(req) {
  try {
    const body = await req.json();

    await CreateServer();
    const cookieStore = await cookies();
    const token = cookieStore.get("accesstoken")?.value;
    const decodedToken = verifyJWTToken(token);

    if (!decodedToken) {
      cookieStore.delete("accesstoken");
      return NextResponse.json({ user: null });
    }

    const session = await SessionTable.findOne({ token }).populate("userId").lean();


    const updatedUser = await UserTable.findByIdAndUpdate(
      session.userId,
      {
        $set: {
          addresses: {
            name: body.name,
            phone: body.phone,
            address: body.address,
            city: body.city,
            district: body.district,
            state: body.state,
            pincode: Number(body.pincode),
          },
        },
      },
      {
        returnDocument: "after",
      }
    ).select("addresses",);

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      updatedUser
    });


  } catch (error) {
    console.error(error)
    return NextResponse.json({
      success: false,
      message: error
    },)
  }
} 