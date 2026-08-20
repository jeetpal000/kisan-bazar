import { NextResponse } from "next/server";
import crypto from "crypto";
import argon2 from "argon2";

import { CreateServer } from "../../../../utils/db";
import { UserTable } from "../../../../model/auth.Schema";
import { sendEmail } from "@/lib/nodemailer";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function sendResetEmail(user, resetToken) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/login/reset-password?token=${resetToken}`;

  try {
    const result = await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `
        <h2>Password Reset</h2>
        <p>Click the button below to reset your password.</p>
        <a href="${resetLink}" style="display:inline-block;padding:12px 20px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px;">
          Reset Password
        </a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });
    return result;
  } catch (err) {
    throw err;
  }
}

async function findValidUserByToken(token) {
  if (!token) return null;

  return UserTable.findOne({
    passwordResetToken: hashToken(token),
    passwordResetExpires: { $gt: new Date() },
  });
}

export async function POST(req) {
  try {
    await CreateServer();

    const { email } = await req.json();

    const user = await UserTable.findOne({ email });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Email not found"
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(resetToken);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    try {
      await sendResetEmail(user, resetToken);
    } catch (emailError) {
      console.error("Failed to send email, but token saved:", emailError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send reset email. Please try again later.",
          error: emailError.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset link sent successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await CreateServer();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Reset token is required" },
        { status: 400 }
      );
    }

    const user = await findValidUserByToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "This reset link is invalid or has expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Token is valid" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Unable to verify reset token" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await CreateServer();

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: "Token and password are required" },
        { status: 400 }
      );
    }

    const user = await findValidUserByToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "This reset link is invalid or has expired" },
        { status: 400 }
      );
    }

    const hashedPassword = await argon2.hash(password);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Unable to update password" },
      { status: 500 }
    );
  }
}