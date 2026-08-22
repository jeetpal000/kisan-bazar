import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ChatMessageTable } from "@/model/auth.Schema";
import { CreateServer } from "@/utils/db";

async function getUserId() {
  const token = (await cookies()).get("accesstoken")?.value;
  try {
    return jwt.verify(token, process.env.SECRET_KEY)?.id || null;
  } catch {
    return null;
  }
}

export async function GET() {
  const currentUserId = await getUserId();
  if (!currentUserId) return NextResponse.json({ chats: [] }, { status: 401 });

  await CreateServer();
  const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
  const chats = await ChatMessageTable.aggregate([
    { $match: { $or: [{ senderId: currentUserObjectId }, { receiverId: currentUserObjectId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: { $cond: [{ $eq: ["$senderId", currentUserObjectId] }, "$receiverId", "$senderId"] },
        lastMessage: { $first: "$text" },
        lastMessageAt: { $first: "$createdAt" },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ["$receiverId", currentUserObjectId] }, { $ne: ["$status", "read"] }] },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { lastMessageAt: -1 } },
    { $limit: 50 },
    { $lookup: { from: "usertables", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        id: { $toString: "$user._id" },
        farmername: "$user.farmername",
        role: "$user.role",
        profileImage: "$user.profileImage",
        lastMessage: 1,
        lastMessageAt: 1,
        unreadCount: 1,
      },
    },
  ]);

  return NextResponse.json({ chats });
}