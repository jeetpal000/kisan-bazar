import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ChatMessageTable, UserTable } from "@/model/auth.Schema";
import { CreateServer } from "@/utils/db";

async function getCurrentUserId() {
  const token = (await cookies()).get("accesstoken")?.value;
  try {
    return jwt.verify(token, process.env.SECRET_KEY)?.id || null;
  } catch {
    return null;
  }
}

export async function GET(req, { params }) {
  const currentUserId = await getCurrentUserId();
  const { userId } = await params;
  if (!currentUserId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await CreateServer();
  const otherUser = await UserTable.findById(userId).select("farmername role profileImage").lean();
  if (!otherUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const messages = await ChatMessageTable.find({
    $or: [
      { senderId: currentUserId, receiverId: userId },
      { senderId: userId, receiverId: currentUserId },
    ],
  }).sort({ createdAt: 1 }).limit(200).lean();

  await ChatMessageTable.updateMany(
    { senderId: userId, receiverId: currentUserId, status: { $ne: "read" } },
    { $set: { status: "read", readAt: new Date() } },
  );

  return NextResponse.json({
    user: { ...otherUser, id: otherUser._id.toString(), _id: undefined },
    messages: messages.map((message) => ({ ...message, id: message._id.toString(), _id: undefined })),
  });
}

export async function POST(req, { params }) {
  const currentUserId = await getCurrentUserId();
  const { userId } = await params;
  if (!currentUserId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ message: "Message is required" }, { status: 400 });

  await CreateServer();
  const receiver = await UserTable.exists({ _id: userId });
  if (!receiver || currentUserId === userId) return NextResponse.json({ message: "Invalid recipient" }, { status: 400 });

  const message = await ChatMessageTable.create({
    senderId: currentUserId,
    receiverId: userId,
    text: text.trim(),
  });

  return NextResponse.json({
    message: { ...message.toObject(), id: message._id.toString(), _id: undefined },
  }, { status: 201 });
}

export async function PATCH(req, { params }) {
  const currentUserId = await getCurrentUserId();
  const { userId } = await params;
  if (!currentUserId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await CreateServer();
  await ChatMessageTable.updateMany(
    { senderId: userId, receiverId: currentUserId, status: { $ne: "read" } },
    { $set: { status: "read", readAt: new Date() } },
  );
  return NextResponse.json({ success: true });
}