"use client";
import FeaturedProduct from "@/components/product/FeaturedProduct";

import LandingPage from "@/components/LandinPage";

import React from "react";
import Footer from "@/components/Footer";
import ShopCategory from "@/components/product/ShopCategory";
import LatestBlog from "@/components/blog/LatestBlog";
import WeatherCard from "@/components/WeatherCard";

const HomePage = () => {
  return (
    <main className="">
      {/* <Header /> */}
      <LandingPage />
      <div className="max-w-360 mx-auto px-4 lg:px-10">
        <WeatherCard />
        <ShopCategory />
        <FeaturedProduct />
        <LatestBlog />
      </div>
      <Footer />
    </main>
  );
};

export default HomePage;
