"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BiMessageRoundedError } from "react-icons/bi";
import { CiViewTable } from "react-icons/ci";
import { FaUsers } from "react-icons/fa";
import { IoCartOutline, IoSettingsOutline } from "react-icons/io5";
import { LuBaggageClaim, LuLayoutDashboard, LuPyramid } from "react-icons/lu";
import { MdOutlineReportProblem } from "react-icons/md";

const adminPanelLink = [
  { name: "Dashboard", icon: LuLayoutDashboard },
  { name: "Users", icon: FaUsers },
  { name: "Sellers", icon: LuBaggageClaim },
  { name: "Products", icon: LuPyramid },
  { name: "Blogs", icon: LuPyramid },
  { name: "Orders", icon: IoCartOutline },
  { name: "Categories", icon: CiViewTable },
  { name: "Reports", icon: MdOutlineReportProblem },
  { name: "Complaints", icon: BiMessageRoundedError },
  { name: "Settings", icon: IoSettingsOutline },
];
const Page = () => {
  const [userData, setUserData] = useState([]);
  const [content, setContent] = useState({
    products: [],
    blogs: [],
    orders: [],
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/usersdata", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        console.log(data);
        setUserData(data);
      } catch (error) {
        console.error("Failed to load user data", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
    fetch("/api/admin/content", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setContent(data);
      })
      .catch((error) => console.error("Failed to load admin content", error));
  }, []);

  const updateSellerAccess = async (id, action) => {
    try {
      const res = await fetch(`/api/approve-seller/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (res.ok) {
        setUserData((prev) => ({
          ...prev,
          users: prev.users.map((user) => (user._id === id ? data.user : user)),
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.farmername} and all related content?`))
      return;
    const res = await fetch(`/api/admin/users/${user._id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) return window.alert(data.message || "Unable to delete user");
    setUserData((prev) => ({
      ...prev,
      users: prev.users.filter((item) => item._id !== user._id),
    }));
    window.alert(data.message);
  };

  const deleteContent = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    const res = await fetch("/api/admin/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    });
    const data = await res.json();
    if (!res.ok)
      return window.alert(data.message || "Unable to delete content");
    setContent((prev) => ({
      ...prev,
      [`${type}s`]: prev[`${type}s`].filter((item) => item._id !== id),
    }));
  };

  if (loading) {
    return (
      <main className="max-w-360 mx-auto px-10 mt-30">
        <div className="flex items-center justify-center h-60">
          <span className="w-12 h-12 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin"></span>
        </div>
      </main>
    );
  }
  return (
    <main className="">
      {/* <Header /> */}
      <aside className="shadow-md rounded bg-[#085108] border border-[#8080802b] py-5 px-2 fixed z-50 top-0 w-full ">
        <ul className="flex justify-center gap-2 items-start">
          {adminPanelLink.map((item, idx) => (
            <Link
              href={`#${item.name}`}
              key={idx}
              className="w-full text-[white] p-2 rounded hover:bg-[#00bd00b0]   cursor-pointer flex gap-1 items-center"
            >
              {item.icon && <item.icon />}
              {item.name}
            </Link>
          ))}
        </ul>
      </aside>
      <section id="Dashboard" className=" mx-auto mt-18 p-4 h-[90vh]">
        <div className="">
          <aside className="pt-5">
            <div className="flex justify-between flex-col">
              <span className="text-xl font-bold ">DashBoard Overview</span>
              <span className="text-xs">
                Welcome back, Overview of the latest month.
              </span>
            </div>
            <div className="grid grid-cols-3 py-4">
              <div className="flex gap-2 items-center border border-[#80808034] p-2 rounded shadow-md group hover:shadow-2xl">
                <FaUsers className="h-8 w-8 text-green-500 bg-green-100 p-1 rounded group-hover:scale-105 transition-all duration-500" />
                <p className="flex flex-col gap-1 items-start group-hover:scale-105 transition-all duration-500">
                  <span className="font-bold ">Total Users</span>
                  <span className="font-bold text-xl">1,250</span>
                  <span className="text-xs">12.5% from the last week</span>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <section id="Users" className="h-[90vh] p-4 ">
        <div className="flex justify-between flex-col">
          <span className="text-xl font-bold ">Users Data</span>
          <span className="text-xs">All users are here.</span>
        </div>
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="max-h-125 overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-green-700 text-white z-10">
                <tr>
                  <th className="border px-4 py-3 text-left">S.No.</th>
                  <th className="border px-4 py-3 text-left">Name</th>
                  <th className="border px-4 py-3 text-left">Email</th>
                  <th className="border px-4 py-3 text-left">Phone</th>
                  <th className="border px-4 py-3 text-left">Role</th>
                  <th className="border px-4 py-3 text-left">Status</th>
                  <th className="border px-4 py-3 text-left">Control</th>
                </tr>
              </thead>

              <tbody>
                {userData.users.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border px-4 py-3">{index + 1}</td>
                    <td className="border px-4 py-3">{user?.farmername}</td>
                    <td className="border px-4 py-3">{user?.email} </td>
                    <td className="border px-4 py-3">{user?.phone}</td>
                    <td className="border px-4 py-3">{user?.role}</td>
                    <td className="border px-4 py-3">
                      <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-sm">
                        {user?.sellerStatus}
                      </span>
                      {user?.sellerStatus === "pending" ? (
                        <button
                          onClick={() =>
                            updateSellerAccess(user?._id, "approve")
                          }
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                      ) : user?.sellerStatus === "approved" ? (
                        <button
                          onClick={() =>
                            updateSellerAccess(user?._id, "revoke")
                          }
                          className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Revoke
                        </button>
                      ) : (
                        ""
                      )}
                      {user?.role !== "admin" && (
                        <button
                          onClick={() => deleteUser(user)}
                          className="ml-2 rounded bg-red-700 px-3 py-1 text-white hover:bg-red-800"
                        >
                          Delete User
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section id="Products" className="p-4">
        <h2 className="text-xl font-bold">Product Control</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-green-700 text-left text-white">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Seller</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Control</th>
              </tr>
            </thead>
            <tbody>
              {content.products.map((product) => (
                <tr key={product._id} className="border-t">
                  <td className="p-3">{product.productName}</td>
                  <td className="p-3">{product.userId?.farmername || "-"}</td>
                  <td className="p-3">{product.stock}</td>
                  <td className="p-3">
                    <button
                      onClick={() => deleteContent("product", product._id)}
                      className="rounded bg-red-700 px-3 py-1 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section id="Blogs" className="p-4">
        <h2 className="text-xl font-bold">Blog Control</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-green-700 text-left text-white">
              <tr>
                <th className="p-3">Blog</th>
                <th className="p-3">Author</th>
                <th className="p-3">Control</th>
              </tr>
            </thead>
            <tbody>
              {content.blogs.map((blog) => (
                <tr key={blog._id} className="border-t">
                  <td className="p-3">{blog.blogName}</td>
                  <td className="p-3">{blog.userId?.farmername || "-"}</td>
                  <td className="p-3">
                    <button
                      onClick={() => deleteContent("blog", blog._id)}
                      className="rounded bg-red-700 px-3 py-1 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section id="Orders" className="p-4">
        <h2 className="text-xl font-bold">Order Control</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-green-700 text-left text-white">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Buyer</th>
                <th className="p-3">Seller</th>
                <th className="p-3">Status</th>
                <th className="p-3">Control</th>
              </tr>
            </thead>
            <tbody>
              {content.orders.map((order) => (
                <tr key={order._id} className="border-t">
                  <td className="p-3">{order.productName}</td>
                  <td className="p-3">{order.userId?.farmername || "-"}</td>
                  <td className="p-3">{order.sellerId?.farmername || "-"}</td>
                  <td className="p-3">{order.orderStatus}</td>
                  <td className="p-3">
                    <button
                      onClick={() => deleteContent("order", order._id)}
                      className="rounded bg-red-700 px-3 py-1 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default Page;
