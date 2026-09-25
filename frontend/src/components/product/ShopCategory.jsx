"use client";
import Image from "next/image";
import React from "react";

const shopTitle = [
  { name: "Grains", icon: "/assets/grains.png", bg: "#e1d56689" },
  { name: "Plants", icon: "/assets/plants.png", bg: "#49b62872" },
  { name: "Vegitable", icon: "/assets/vegitable.png", bg: "#ffcf5472" },
  { name: "Fruits", icon: "/assets/fruits.png", bg: "#fb777172" },
];
const ShopCategory = () => {
  return (
    <section className="my-7 mx-auto ">
      <div className="relative">
        <div className="w-1/6 sm:w-1/5 md:w-1/3 h-px bg-[#79b061ab] absolute top-1/2 -translate-y-1/2 rounded-md" />
        <h1 className="text-center font-bold text-sm sm:text-xl md:text-2xl lg:text-3xl">
          Shop by Category
        </h1>
        <div className="w-1/5 sm:w-1/4 md:w-1/3 h-px bg-[#79b061ab] absolute top-1/2 -translate-y-1/2 right-0 rounded-md" />
      </div>

      <div className="flex items-center justify-around gap-2 mt-5">
        {shopTitle.map((item, index) => (
          <div
            className="flex flex-col items-center justify-center"
            key={index}
          >
            <figure
              style={{ backgroundColor: item.bg }}
              className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full shadow-2xl shadow-black my-2 group overflow-hidden`}
            >
              <Image
                src={item.icon}
                alt={item.name}
                width={65}
                height={65}
                className="transform-transition duration-300 group-hover:scale-115"
              />
            </figure>
            <p className="font-medium md:text-xl">{item.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShopCategory;
