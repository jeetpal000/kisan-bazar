"use client";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { FaRegHeart, FaHeart, FaSearch } from "react-icons/fa";
import { IoCart, IoCartOutline } from "react-icons/io5";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/authStore";
import { useCartStore } from "@/lib/cartStore";
import { useWishlistStore } from "@/lib/wishlistStore";
import { RiMenuFold2Line, RiMenuUnfold2Line } from "react-icons/ri";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpenUser, setIsOpenUser] = useState(false);
  const pathname = usePathname();
  const { user, setUser, clearUser, setHydrated } = useAuthStore();

  const { data, isFetched } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const res = await fetch("/api/userdata", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load user data");
      const payload = await res.json();
      return payload.user;
    },
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (isFetched) {
      setHydrated(true);
      if (data) {
        setUser(data);
      } else {
        clearUser();
      }
    }
  }, [data, isFetched, setHydrated, setUser, clearUser]);

  const { cart, setCart, clearCart } = useCartStore();

  const { data: cartData, isFetched: cartFetched } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/products/cart");

      if (!res.ok) throw new Error("Failed");

      const data = res.json();
      return data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (cartFetched) {
      if (cartData?.cart) {
        setCart(cartData.cart);
      } else {
        clearCart();
      }
    }
  }, [cartData, cartFetched]);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const userData = user;

  const { wishlist, setWishlist, clearWishlist } = useWishlistStore();

  const { data: wishlistData, isFetched: wishlistFetched } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await fetch("/api/products/favorite");
      if (!res.ok) throw new Error("Failed");
      const data = res.json();
      return data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (wishlistFetched) {
      if (wishlistData?.wishlist) {
        setWishlist(wishlistData.wishlist);
      } else {
        clearWishlist();
      }
    }
  }, [wishlistData, wishlistFetched]);

  const linkClass = (path) => {
    return `relative inline-block before:content-[''] before:absolute before:left-0 before:bottom-0 
    before:h-0.5 before:bg-gradient-to-r before:from-[#7de54d] before:to-[#085108] before:rounded-full 
    before:transition-all before:duration-300 transition-all duration-500
    ${
      pathname === path
        ? "text-[#7de54d] scale-105 before:w-full"
        : "text-white hover:before:w-full hover:scale-105 before:w-0"
    }`;
  };
  return (
    <header className="fixed left-0 top-0 z-50 w-full">
      <section className="bg-[#085108] backdrop-blur-2xl py-1 md:py-3 px-2 flex items-center justify-between relative">
        {/* logo */}
        <div className="items-center gap-5">
          <Link
            href="/"
            className=" text-2xl md:text-3xl font-bold tracking-wider font-serif text-white whitespace-nowrap"
          >
            🌿Kisan
            <span className="text-[#7de54d]">Bazar</span>
          </Link>
        </div>
        {/* nav-link */}
        <ul className="items-center gap-3 hidden md:flex">
          <li className="text-white font-medium text-xl relative">
            <Link href="/" className={linkClass("/")}>
              Home
            </Link>
          </li>
          {/* <li className="text-white font-medium text-xl ">
            <Link href="/product" className={linkClass("/product")}>
              Product
            </Link>
          </li> */}
          <li className="text-white font-medium text-xl ">
            <Link href="/blog" className={linkClass("/blog")}>
              Blog
            </Link>
          </li>
          <li className="text-white font-medium text-xl before: ">
            <Link href="/shopping" className={linkClass("/shopping")}>
              Shop
            </Link>
          </li>
          <li className="text-white font-medium text-xl">
            <Link href="/orders" className={linkClass("/orders")}>
              My Orders
            </Link>
          </li>
        </ul>
        {/* search */}
        <div className="hidden md:block">
          <div className="hover:shadow-blue-500 hover:shadow-2xl relative hidden lg:block">
            <div className="relative">
              <Input
                id="input-button-group"
                placeholder="Search for grains, platns, fruits.."
                className="peer rounded pr-6"
              />
              <div className="bg-[#c5c5c537] items-center justify-center rounded-full  w-7 h-7 absolute right-0.5 top-1/2 -translate-y-1/2  active:scale-95 z-10 cursor-pointer p-1 ">
                <FaSearch className="text-white text-2xl " />
              </div>
            </div>
          </div>
          <div className=" lg:hidden flex items-center justify-center w-10 h-10 backdrop-blur-2xl bg-[#1fac551e] rounded-full cursor-pointer hover:shadow-2xl hover:shadow-[#e9e9e9] active:scale-95">
            <FaSearch className=" text-white" />
          </div>
        </div>
        {/* user & cart */}
        <div className="gap-5 hidden md:flex">
          <div className="relative">
            <Link href="/shopping/cart">
              <IoCart className="text-pink-500 text-4xl relative" />
              <p className="font-bold text-xs bg-[#3ab800] w-5 h-5 flex items-center justify-center p-2 rounded-full  text-white text-center absolute top-0 right-0  ">
                {totalItems}
              </p>
            </Link>
          </div>
          <div className="relative">
            <Link href="/shopping/favorite">
              <FaHeart className="text-pink-500 text-4xl p-1" />
              <p className="font-bold text-xs bg-[#3ab800] w-5 h-5 flex items-center justify-center p-2 rounded-full  text-white text-center absolute top-0 right-0  ">
                {wishlist.length || "0"}
              </p>
            </Link>
          </div>
          <div className="">
            <div className="shrink-0">
              <Link
                href={userData ? "/profile" : "/login"}
                onClick={() => setIsOpenUser(!isOpenUser)}
                className="group flex items-center gap-2 rounded-full px-2 py-1 text-white hover:shadow-2xl hover:shadow-black transition-all duration-300 active:scale-95 cursor-pointer pointer-events-auto touch-manipulation"
              >
                <span className="w-10 h-10 rounded-full bg-[#9bff9b47] overflow-hidden transition-transform duration-200 group-hover:scale-105">
                  <Image
                    src={userData?.profileImage || "/assets/user.png"}
                    alt="user"
                    width={40}
                    height={40}
                    className="object-cover w-full h-auto"
                    loading="eager"
                  />
                </span>
                <span className="text-xs ">{userData?.farmername || " "}</span>
              </Link>
            </div>
          </div>
          <div className=""></div>
        </div>

        <div
          className={`fixed top-11 right-0 z-50 h-screen w-72 bg-[#085108]
        transition-transform duration-300 ease
        ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {isMenuOpen && (
            <>
              <div className="z-50 flex flex-col pl-5">
                <ul className="space-y-4 pb-2 flex flex-col w-full">
                  <li
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-white font-medium text-xl relative"
                  >
                    <Link href="/" className={`${linkClass("/")} w-full`}>
                      Home
                    </Link>
                  </li>
                  <li
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-white font-medium text-xl "
                  >
                    <Link
                      href="/blog"
                      className={`${linkClass("/blog")} w-full`}
                    >
                      Blog
                    </Link>
                  </li>
                  <li
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-white font-medium text-xl before: "
                  >
                    <Link
                      href="/shopping"
                      className={`${linkClass("/shopping")} w-full`}
                    >
                      Shop
                    </Link>
                  </li>
                  <li
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-white font-medium text-xl"
                  >
                    <Link
                      href="/orders"
                      className={`${linkClass("/orders")} w-full`}
                    >
                      My Orders
                    </Link>
                  </li>
                </ul>
                {/* search */}
                <div className="">
                  <div className="hover:shadow-blue-500 hover:shadow-2xl relative hidden lg:block">
                    <div className="relative">
                      <Input
                        id="input-button-group"
                        placeholder="Search for grains, platns, fruits.."
                        className="peer rounded pr-6"
                      />
                      <div className="bg-[#c5c5c537] items-center justify-center rounded-full  w-7 h-7 absolute right-0.5 top-1/2 -translate-y-1/2  active:scale-95 z-10 cursor-pointer p-1 ">
                        <FaSearch className="text-white text-2xl " />
                      </div>
                    </div>
                  </div>
                  <div className=" lg:hidden flex items-center justify-center w-10 h-10 backdrop-blur-2xl bg-[#1fac551e] rounded-full cursor-pointer hover:shadow-2xl hover:shadow-[#e9e9e9] active:scale-95">
                    <FaSearch className=" text-white" />
                  </div>
                </div>
                {/* user & cart */}
                <div className="gap-5">
                  <div
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="relative w-fit"
                  >
                    <Link href="/shopping/cart">
                      <IoCart className="text-pink-500 text-4xl relative" />
                      <p className="font-bold text-xs bg-[#9dff70b9] w-4 h-4 flex items-center justify-center p-1 rounded-full  text-white text-center absolute top-0 left-5">
                        {totalItems}
                      </p>
                    </Link>
                  </div>
                  <div
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="relative w-fit"
                  >
                    <Link href="/shopping/favorite">
                      <FaHeart className="text-pink-500 text-4xl p-1" />
                      <p className="font-bold text-xs bg-[#9dff70b9] w-4 h-4 flex items-center justify-center p-1 rounded-full  text-white text-center absolute top-0 left-5  ">
                        {wishlist.length || "0"}
                      </p>
                    </Link>
                  </div>
                  <div className="border rounded-full border-[#55b402]">
                    <div
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="shrink-0"
                    >
                      <Link
                        href={userData ? "/profile" : "/login"}
                        onClick={() => setIsOpenUser(!isOpenUser)}
                        className="group flex items-center gap-2 rounded-full px-2 py-1 text-white hover:shadow-2xl hover:shadow-black transition-all duration-300 active:scale-95 cursor-pointer pointer-events-auto touch-manipulation"
                      >
                        <span className="w-10 h-10 rounded-full bg-[#9bff9b47] overflow-hidden transition-transform duration-200 group-hover:scale-105">
                          <Image
                            src={userData?.profileImage || "/assets/user.png"}
                            alt="user"
                            width={40}
                            height={40}
                            className="object-cover w-full h-auto"
                            loading="eager"
                          />
                        </span>
                        <span className="text-xs ">
                          {userData?.farmername || " "}
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden pr-3 p-1 rounded bg-[#dbfcc74e] backdrop-blur-2xl text-white active:scale-95"
        >
          {isMenuOpen ? (
            <RiMenuFold2Line className="w-8 h-8" />
          ) : (
            <RiMenuUnfold2Line className="w-8 h-8" />
          )}
        </div>
      </section>
    </header>
  );
};

export default Header;
