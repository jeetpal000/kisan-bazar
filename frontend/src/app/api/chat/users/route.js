import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { CreateServer } from "@/utils/db";
import { UserTable } from "@/model/auth.Schema";

async function getUserId() {
  const token = (await cookies()).get("accesstoken")?.value;
  try {
    return jwt.verify(token, process.env.SECRET_KEY)?.id || null;
  } catch {
    return null;
  }
}

export async function GET(req) {
  const currentUserId = await getUserId();
  if (!currentUserId) return NextResponse.json({ users: [] }, { status: 401 });

  await CreateServer();
  const search = new URL(req.url).searchParams.get("search")?.trim() || "";
  const query = { _id: { $ne: currentUserId } };
  if (search) query.farmername = { $regex: search, $options: "i" };

  const users = await UserTable.find(query)
    .select("farmername role profileImage")
    .sort({ farmername: 1 })
    .limit(50)
    .lean();

  return NextResponse.json({
    users: users.map((user) => ({ ...user, id: user._id.toString(), _id: undefined })),
  });
}