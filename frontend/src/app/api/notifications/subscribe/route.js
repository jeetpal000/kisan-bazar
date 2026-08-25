import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PushSubscriptionTable } from "@/model/auth.Schema";
import { CreateServer } from "@/utils/db";

async function getCurrentUserId() {
  try {
    return jwt.verify((await cookies()).get("accesstoken")?.value, process.env.SECRET_KEY)?.id || null;
  } catch {
    return null;
  }
}

export async function POST(request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const subscription = await request.json();
  if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return NextResponse.json({ message: "Invalid subscription" }, { status: 400 });
  }
  await CreateServer();
  await PushSubscriptionTable.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    { userId, endpoint: subscription.endpoint, keys: subscription.keys },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { endpoint } = await request.json();
  await CreateServer();
  await PushSubscriptionTable.deleteOne({ userId, endpoint });
  return NextResponse.json({ success: true });
}