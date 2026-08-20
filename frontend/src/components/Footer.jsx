"use client";
import React from "react";
import { FaGithub, FaInstagram, FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-linear-to-tr from-[#0c4800] via-[#42663f] to-[#157115]">
      <section className="  ">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-360 mx-auto lg:px-10 lg:py-10 p-4">
          <ul className="">
            <li className="font-medium text-[#2aff2a]  border-b-2 mb-4 border-[#b5b5b567]">
              About Us
            </li>
            <li className="text-gray-300 hover:text-gray-100 cursor-pointer transition-all duration-200">
              Our Story
            </li>
            <li className="text-gray-300 hover:text-gray-100 cursor-pointer transition-all duration-200 mt-2">
              Contact
            </li>
          </ul>
          <ul className="">
            <li className="font-medium text-[#2aff2a]  border-b-2 mb-4 border-[#7e7e7e67]">
              Customer Service
            </li>
            <li className="text-gray-300 hover:text-gray-100 cursor-pointer transition-all duration-200">
              FAQs
            </li>
            <li className="text-gray-300 hover:text-gray-100 cursor-pointer transition-all duration-200 mt-2">
              Shipping & Returns
            </li>
          </ul>
          <ul className="col-span-1 md:col-span-1">
            <li className="font-medium text-[#2aff2a]  border-b-2 mb-4 border-[#7e7e7e67]">
              Quick Links
            </li>
            <li className="text-gray-300 hover:text-gray-100 cursor-pointer transition-all duration-200">
              Products
            </li>
            <li className="text-gray-300 hover:text-gray-100 cursor-pointer transition-all duration-200 mt-2">
              Blog
            </li>
          </ul>
          <div className="col-span-1 md:col-span-1">
            <p className="font-medium text-[#2aff2a]  border-b-2 mb-4 border-[#7e7e7e67]">
              Follows Us
            </p>
            <ul className="flex items-center gap-4">
              <li>
                <FaGithub
                  size={30}
                  className="cursor-pointer hover:-translate-y-0.5 transition-all duration-200 text-gray-200 hover:text-white"
                />
              </li>
              <li>
                <FaInstagram
                  size={30}
                  className="text-pink-400 hover:text-pink-500 hover:-translate-y-0.5 transition-all duration-200  cursor-pointer"
                />
              </li>
              <li>
                <FaXTwitter
                  size={30}
                  className="cursor-pointer hover:-translate-y-0.5 transition-all duration-200 text-gray-200 hover:text-white"
                />
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t-2 border-[#8080809d] p-4">
          <p className="text-center">
            <code className="text-[#cccccce0]">
              © {new Date().getFullYear()} Kisan Bazar. All rights reserved.
            </code>
          </p>
        </div>
      </section>
    </footer>
  );
};

export default Footer;
