"use client";
import Footer from "@/components/Footer";
import ProfileLeftPage from "@/app/profile/components/ProfileLeftPage";
import ProfileSellerPanel from "@/app/profile/components/ProfileSellerPanel";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { FaLocationDot, FaPhone } from "react-icons/fa6";
import ProfileBlogCard from "./components/ProfileBlogCard";
import BlogUpload from "./components/BlogUpload";
import ProfileProductCard from "./components/ProfileProductCard";
import SellerOrders from "./components/SellerOrders";

const Page = () => {
  const [userData, setUserData] = useState(null);
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [productLoading, setProductLoading] = useState(true);
  const [blogLoading, setBlogLoading] = useState(true);
  const [userDataLoading, setUserDataLoading] = useState(true);
  const [uploadBlog, setUploadBlog] = useState(false);

  const loadUser = async () => {
    try {
      const res = await fetch("/api/userdata", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setUserData(data.user);
    } catch (error) {
      console.error("Failed to load user data", error);
    } finally {
      setUserDataLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products/my-product", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setProductLoading(false);
    }
  };
  const loadBlogs = async () => {
    try {
      const res = await fetch("/api/blog/my-blog", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs || []);
      }
    } catch (error) {
      console.error("Failed to load blogs", error);
    } finally {
      setBlogLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    loadBlogs();
  }, []);

  useEffect(() => {
    if (userData?.role === "seller" && userData?.sellerStatus === "approved") {
      loadProducts();
    } else {
      setProductLoading(false);
    }
  }, [userData]);

  return (
    <>
      <main className="max-w-360 mx-auto p-2 md:p-5 lg:px-10 mt-20 md:mt25 lg:mt-30">
        <div className="grid grid-cols-4 gap-5 ">
          <div className="col-span-4 md:col-span-1">
            <ProfileLeftPage
              userData={userData}
              onProfileUpdated={setUserData}
            />
          </div>
          <div className="md:col-span-3 col-span-4">
            <section className="bg-gray-100 rounded-xl p-2 md:p-3">
              <div className="flex justify-between items-start">
                <p className="flex flex-col">
                  <span className="text-xl md:text-2xl font-bold flex items-center gap-1">
                    {userData?.farmername}{" "}
                    {userData?.sellerStatus === "approved" && (
                      <i className="text-xs font-medium border border-green-500 rounded-xl sm:px-2 p-1 text-green-600">
                        verified Seller
                      </i>
                    )}
                  </span>

                  <span className="">{userData?.email}</span>
                </p>
                <Link
                  href={
                    userData?.role === "seller"
                      ? `/profile/seller/${userData?.id}`
                      : "/profile/edit"
                  }
                  className="flex gap-2 items-center  font-semibold cursor-pointer hover:shadow-2xl hover:shadow-[#244527] border border-[#029102] text-[#029102] px-2 sm:px-3 py-1 sm:py-2 rounded-md group transition-all duration-300 active:scale-95"
                >
                  Edit Profile
                  <FaEdit className="transform transition-transform duration-300 group-hover:translate-x-2" />
                </Link>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                <p className="">
                  <span className="flex items-center gap-2">
                    <FaPhone className="text-green-600" />
                    {userData?.phone}
                  </span>
                </p>
                <p className="">
                  <span className="flex items-center gap-2">
                    <FaLocationDot className="text-green-600" />{" "}
                    {userData?.sellerProfile?.address}
                  </span>
                </p>
              </div>
            </section>
            {userData?.role === "seller" &&
              userData?.sellerStatus === "approved" && (
                <>
                  <ProfileSellerPanel
                    onProductUploaded={() => loadProducts()}
                    onBlogUploaded={() => loadBlogs()}
                  />
                  <SellerOrders />
                  <section className="bg-gray-100 rounded-xl p-3 mt-5">
                    <h1 className="text-xl font-bold">Your All Products</h1>
                    {productLoading ? (
                      <div className="border-3 border-green-600 h-8 w-8 rounded-full border-t-transparent animate-spin" />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mt-4">
                        {products.length === 0 ? (
                          <p className="text-gray-600">
                            No products uploaded yet.
                          </p>
                        ) : (
                          products.map((product) => (
                            <ProfileProductCard
                              key={product._id}
                              product={product}
                              onProductUploadedSuccess={() => loadProducts()}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </section>
                </>
              )}

            {userData && (
              <section className="mt-5 rounded-xl bg-gray-100 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">Blog Panel</h2>
                    <p className="text-sm text-gray-600">
                      Share farming knowledge and updates with the community.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadBlog(true)}
                    className="rounded-md bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800"
                  >
                    Upload Blog
                  </button>
                </div>
              </section>
            )}

            <section className="bg-gray-100 rounded-xl p-3 mt-5">
              <h1 className="text-xl font-bold">Your All Blog</h1>
              <div className="mt-4">
                {blogLoading ? (
                  <div className=" border-3 border-green-600 h-8 w-8 rounded-full border-t-transparent animate-spin" />
                ) : blogs.length === 0 ? (
                  <p className="text-gray-600">No blogs uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                      <ProfileBlogCard
                        key={blog._id}
                        blog={blog}
                        onBlogUploadedSuccess={() => loadBlogs()}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
      {uploadBlog && (
        <BlogUpload
          setUploadBlog={setUploadBlog}
          onUploadSuccess={() => loadBlogs()}
        />
      )}
      <Footer />
    </>
  );
};

export default Page;
