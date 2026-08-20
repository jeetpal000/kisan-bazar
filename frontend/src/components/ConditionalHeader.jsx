"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isProductDetailsPage = /^\/shopping\/[a-fA-F0-9]{24}$/.test(pathname);
  const hideShoppingHeader =
    pathname?.startsWith("/shopping/") &&
    pathname !== "/shopping/cart" &&
    pathname !== "/shopping/favorite" &&
    !isProductDetailsPage;
  if (
    (pathname?.startsWith("/blog/") && pathname !== "/blog") ||
    hideShoppingHeader ||
    pathname?.startsWith("/profile/seller/") ||
    pathname?.startsWith("/admin")
  ) {
    return null;
  }
  return <Header />;
}
