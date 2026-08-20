import React, { useState } from "react";
import { AiOutlineProduct } from "react-icons/ai";
import { MdAddBusiness } from "react-icons/md";
import { FaPhotoVideo } from "react-icons/fa";
import BlogUpload from "./BlogUpload";
import ProductUpload from "./ProductUpload";

const ProfileSellerPanel = ({ onProductUploaded, onBlogUploaded }) => {
  const [uploadProduct, setUploadProduct] = useState(false);
  const [uploadBlog, setUploadBlog] = useState(false);
  return (
    <>
      <main className="grid sm:grid-cols-2 grid-cols-1 gap-2">
        <section className="mt-5 bg-gray-100 rounded-xl p-3 ">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AiOutlineProduct className="w-10 h-10 p-1 bg-[#1eda1e1b] text-green-600 rounded-md" />
              <p className="flex flex-col gap-1">
                <b className="">Seller Panel</b>
                <span className="">
                  Manage your products and grow your business
                </span>
              </p>
            </div>
          </div>
          <div className="py-4 px-10">
            <div
              onClick={() => setUploadProduct(true)}
              className="border-2 border-dashed active:border-green-500 hover:border-green-500 border-[#80808028] rounded-md p-4 flex items-center justify-center cursor-pointer"
            >
              <div className="flex flex-col gap-3 items-center justify-center">
                <MdAddBusiness className="text-green-600 w-10 h-10" />
                <b className="">Add New Product</b>
                <span className="">
                  List your products and reach thousands of buyers
                </span>
                <button
                  onClick={() => setUploadProduct(true)}
                  className="flex gap-1 items-center  font-bold cursor-pointer hover:shadow-2xl hover:shadow-[#244527] border border-[#029102] text-[white] bg-[#029102] px-3 py-2 rounded-md group transition-all duration-300 active:scale-95"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-5 bg-gray-100 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AiOutlineProduct className="w-10 h-10 p-1 bg-[#1eda1e1b] text-green-600 rounded-md" />
              <p className="flex flex-col gap-1">
                <b className="">Blog Panel</b>
                <span className="">
                  Manage your Blogs and grow your thoughts
                </span>
              </p>
            </div>
          </div>
          <div className="py-4 px-10">
            <div
              onClick={() => setUploadBlog(true)}
              className="border-2 border-dashed active:border-green-500 hover:border-green-500 border-[#80808028] rounded-md p-4 flex items-center justify-center cursor-pointer"
            >
              <div className="flex flex-col gap-3 items-center justify-center">
                <FaPhotoVideo className="text-green-600 w-10 h-10" />
                <b className="">Add New Blog</b>
                <span className="">
                  List your Blog and reach thousands of customers
                </span>
                <button
                  onClick={() => setUploadBlog(true)}
                  className="flex gap-1 items-center  font-bold cursor-pointer hover:shadow-2xl hover:shadow-[#244527] border border-[#029102] text-[white] bg-[#029102] px-3 py-2 rounded-md group transition-all duration-300 active:scale-95"
                >
                  Add Blog
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      {uploadProduct && (
        <ProductUpload
          setUploadProduct={setUploadProduct}
          onUploadSuccess={onProductUploaded}
        />
      )}
      {uploadBlog && (
        <BlogUpload
          setUploadBlog={setUploadBlog}
          onUploadSuccess={onBlogUploaded}
        />
      )}
    </>
  );
};
export default ProfileSellerPanel;
