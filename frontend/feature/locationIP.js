import { headers } from "next/headers"

const IP_ADDRESS_PRIORITY = [
  "cf-connecting-ip",
  "x-client-ip",
  "x-forwarded-for",
  "x-real-ip",
  "x-cluster-client-ip",
  "forward-for",
  "forward",
];

export async function getIPAddress() {
  const headerList = await headers();
  for (const header of IP_ADDRESS_PRIORITY) {
    const value = headerList.get(header);
    if (typeof value === 'string') {
      const ip = value.split(",")[0].trim();
      if (ip) return ip;
    }
  }
  return "0.0.0.0"
}