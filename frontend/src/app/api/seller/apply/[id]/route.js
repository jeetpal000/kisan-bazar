import { NextResponse } from "next/server";
import { CreateServer } from "@/utils/db";
import { UserTable } from "@/model/auth.Schema";
import { sellerProfileSchema, updateProfileSchema } from "@/validation/auth.validation";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const POST = async (req) => {
  try {
    await CreateServer();

    const body = await req.json();

    const validated = updateProfileSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validated.error.flatten(),
        },
        { status: 400 }
      );
    }
    const cookieStore = await cookies();
    const token = cookieStore.get("accesstoken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY
    );

    const user = await UserTable.findOne({
      email: decoded.email,
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Update top-level user fields as well
    user.farmername = validated.data.farmername || user.farmername;
    user.phone = validated.data.phone || user.phone;

    user.sellerProfile = {
      shopname: validated.data.shopname,
      address: validated.data.address,
      state: validated.data.state,
      district: validated.data.district,
      pincode: Number(validated.data.pincode),
      bankAccountName: validated.data.bankAccountName,
      bankAccountNumber: Number(validated.data.bankAccountNumber),
      ifscCode: validated.data.ifscCode,
      shopnumber: Number(validated.data.shopnumber),
    };

    user.sellerStatus = "pending";

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile Updated",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}