"use client";
import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { IoCartOutline } from "react-icons/io5";
import { FaArrowRight } from "react-icons/fa";
import Link from "next/link";

const featuredProducts = [
  {
    id: 1,
    name: "Fresh Broccoli",
    price: 120,
    originalPrice: 150,
    image: "/assets/vegitable.png",
    unit: "Kg",
  },
  {
    id: 2,
    name: "Organic Wheat",
    price: 25,
    originalPrice: 20,
    image: "/assets/grains.png",
    unit: "Kg",
  },
  {
    id: 3,
    name: "Red Apple",
    price: 180,
    originalPrice: 200,
    image: "/assets/fruits.png",
    unit: "Kg",
  },
  {
    id: 4,
    name: "Aloe Vera Plant",
    price: 300,
    originalPrice: 350,
    image: "/assets/plants.png",
    unit: "Piece",
  },
];

const FeaturedProduct = () => {
  return (
    <section className="my-10 mx-auto px-0 lg:px-2">
      <div className="relative mb-10">
        <div className="w-1/3 h-1 absolute bg-[#79b061ab] top-1/2 -translate-y-1/2 rounded-md right-3 md:left-0" />
        <h1 className="md:text-center font-bold text-2xl lg:text-3xl">
          Featured Product
        </h1>
        <div className="w-1/5 sm:w-1/3 md:w-1/3 h-1 absolute bg-[#79b061ab] top-1/2 -translate-y-1/2 right-0 rounded-md" />
        <Link
          href="/shopping"
          className="absolute top-1/2 -translate-y-1/2 -right-2 rounded-none rounded-tr-full rounded-bl-full px-4 text-[#3eba0a] bg-[#dae1d0] backdrop-blur-2xl hover:bg-[#c8d1bc]"
        >
          View All
        </Link>
      </div>

      {/* Product Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-shadow duration-300 group"
          >
            <figure className="relative w-full h-48 flex items-center justify-center bg-[#f3f3f3] rounded-xl overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                width={150}
                height={150}
                className="object-contain transform transition-transform duration-300 group-hover:scale-110"
              />
              <button className="absolute bottom-2 right-2 bg-[#029102] text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-2xl shadow-black">
                <IoCartOutline
                  size={20}
                  className="cursor-pointer active:scale-95"
                />
              </button>
            </figure>
            <div className="mt-4">
              <p className="font-bold text-lg text-gray-800">{product.name}</p>
              <div className="flex items-center justify-between gap-2 mt-1">
                <div className="flex flex-col">
                  <b className="text-[#029102] text-xl">
                    ₹{product.price}{" "}
                    <span className="text-sm font-medium text-gray-400">
                      /{product.unit}
                    </span>
                  </b>
                  <span className="text-gray-400 line-through text-sm">
                    ₹{product.originalPrice}
                  </span>
                </div>
                <Link
                  href="/shopping/:id"
                  className="flex gap-2 items-center text-white font-medium cursor-pointer hover:shadow-2xl hover:shadow-black bg-[#029102] px-2.5 py-2 rounded-md  transition-all duration-300 active:scale-95"
                >
                  Shop Now{" "}
                  <FaArrowRight className=" transform transition-transform duration-300 group-hover:translate-x-2" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProduct;
