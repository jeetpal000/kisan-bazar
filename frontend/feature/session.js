import { getIPAddress } from "./locationIP";
import { cookies, headers } from "next/headers";
import { SessionTable } from "@/model/auth.Schema";
import jwt from "jsonwebtoken";




export const createSessionSetCookies = async ({ id, name, email, phone, role }) => {

  const ip = await getIPAddress();
  const headersList = await headers();


  const accessToken = createAccessToken({ id, name, email, phone, role });
  const session = await createSession({
    userId: id,
    userAgent: headersList.get("user-agent") || "",
    ip,
    token: accessToken,
  });

  const accessBaseConfig = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
  };
  const cookieStore = await cookies();
  cookieStore.set("accesstoken", accessToken, accessBaseConfig);

  //   const cookieStore = await cookies();

  //   cookieStore.set("session", token, {
  //     secure: true,
  //     httpOnly: true,
  //     maxAge: 30 * 24 * 60 * 60
  //   })
  // }
}

const createSession = async ({ userId, userAgent, ip, token }) => {
  await SessionTable.deleteMany({ userId });
  await SessionTable.create({
    userId,
    userAgent,
    ip,
    token,
  });
}


const createAccessToken = ({ id, name, email, phone, role }) => {
  return jwt.sign({ id, name, email, phone, role }, process.env.SECRET_KEY, {
    expiresIn: "30d"
  })
}