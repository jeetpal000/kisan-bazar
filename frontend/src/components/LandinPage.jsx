"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaArrowRight, FaPlay } from "react-icons/fa";
import ActiveUsers from "@/components/ActiveUsers";

const Landingage = () => {
  const images = ["/assets/landingpage1.jpg", "/assets/landingpage2.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative overflow-hidden w-full h-screen ">
      {/* <section
        style={{ backgroundImage: `url(${images[currentIndex]})` }}
        className=" bg-cover w-full h-full  bg-no-repeat "
      ></section> */}
      {images.map((img, index) => (
        <div
          key={index}
          // className={`absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-1000`}
          style={{ backgroundImage: `url(${img})` }}
          className={`absolute inset-0 flex items-center bg-cover bg-no-repeat transition-opacity duration-1500 ${
            currentIndex === index
              ? "opacity-100 "
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="px-4 lg:px-10 relative z-20 max-w-360">
            <div className="">
              <h1 className="text-3xl text-[#060810f1] md:text-5xl lg:text-6xl font-bold tracking-wider">
                From Our <span className="text-[#07de07]">Fields {""} </span>{" "}
                <br /> to <span className="text-[#07de07]">Your Home</span>
              </h1>
            </div>
            <ul className="flex items-center gap-5 text-[#060810f1]">
              <li className="font-medium text-sm text-shadow-gray-300">
                Fresh
              </li>
              <li className="font-medium text-sm relative before:content[''] before:absolute before:w-2.5 before:h-2.5 before:-left-4 before:top-1/2 before:-translate-y-1/2 before:bg-[#015f01] before:shadow-2xs before:rounded-full">
                Organic
              </li>
              <li className="font-medium text-sm relative before:content[''] before:absolute before:w-2.5 before:h-2.5 before:-left-4 before:top-1/2 before:-translate-y-1/2 before:bg-[#015f01] before:rounded-full">
                Direct from Farmers
              </li>
            </ul>
            <p className="mt-8 text-md font-medium text-[#060810f1]">
              Support local farmers and get the highest quality <br /> product
              delivered fresh to your doorstep.
            </p>
            <div className="flex items-center gap-5  mt-8">
              <Link
                href="/shopping"
                className="flex gap-2 items-center text-white font-bold cursor-pointer hover:shadow-2xl hover:shadow-black bg-[#029102] px-3 py-2 rounded-2xl group transition-all duration-300 active:scale-95"
              >
                Shop Now{" "}
                <FaArrowRight className=" transform transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
              <button className="flex gap-2 items-center border border-gray-600 text-[#029102] font-bold cursor-pointer hover:shadow-2xl hover:shadow-black px-3 py-2 rounded-2xl active:scale-95 transition-all duration-300">
                <div className="bg-[white] w-6 h-6 rounded-full flex items-center justyify-center">
                  <FaPlay className="ml-1" />
                </div>
                Watch Video
              </button>
            </div>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 inset-0 rounded-3xl bg-[#4747476a] md:bg-[#ffffffab] w-full md:w-1/3 h-1/2 flex items-center justify-center blur-3xl " />
        </div>
      ))}
      <div className="absolute bottom-8 left-4 z-30 w-fit rounded-full bg-white/85 px-4 py-2 text-[#085108] shadow-lg backdrop-blur-sm lg:left-10">
        <ActiveUsers />
      </div>
    </div>
  );
};

export default Landingage;
