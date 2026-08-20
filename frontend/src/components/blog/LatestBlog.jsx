"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const blog = [
  {
    title: "Organic Farming Tips",
    details: "Tips for sustainable farming",
    image: "/assets/blog1.jpg",
  },
  {
    title: "Pest Control Methods",
    details: "Effective ways to manage pests",
    image: "/assets/blog2.jpg",
  },
  {
    title: "Pest Control Methods",
    details: "Effective ways to manage pests",
    image: "/assets/blog2.jpg",
  },
];

const LatestBlog = () => {
  return (
    <section className="my-10 mx-auto">
      <div className="relative mb-5">
        <div className="w-1/3 h-1 absolute bg-[#79b061ab] top-1/2 -translate-y-1/2 rounded-md right-10 md:left-0" />
        <h1 className="md:text-center font-bold text-2xl lg:text-3xl">
          Latest Blog
        </h1>
        <div className="w-1/5 sm:w-1/4 md:w-1/3 h-1 absolute bg-[#79b061ab] top-1/2 -translate-y-1/2 right-0 rounded-md" />
        <Link
          href="/blog"
          className="absolute top-1/2 -translate-y-1/2 -right-2 rounded-none rounded-tr-full rounded-bl-full px-4 text-[#3eba0a] bg-[#dae1d0] backdrop-blur-2xl active:translate-y-0.5 py-1"
        >
          View All
        </Link>
      </div>

      {/* Latest Blog */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blog.map((product, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-4 shadow-lg border border-[#ffffff00] hover:shadow-2xl hover:border hover:border-green-500 transition-shadow duration-300 group"
          >
            <figure className="relative w-full h-60 flex items-center justify-center bg-[#f3f3f3] rounded-xl overflow-hidden">
              <Image
                src={product.image}
                alt={product.title}
                width={390}
                height={220}
                className="object-cover transform transition-transform duration-300 group-hover:scale-110 rounded-md"
              />
            </figure>
            <div className="">
              <p className="font-bold text-lg text-gray-800">{product.title}</p>
              <p className="text-gray-400">{product.details}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LatestBlog;
