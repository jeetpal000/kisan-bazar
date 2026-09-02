import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { BiLogOut } from "react-icons/bi";
import { FaCamera } from "react-icons/fa";
import {
  MdAdminPanelSettings,
  MdOutlineSell,
  MdPassword,
} from "react-icons/md";
import { Bounce, toast } from "react-toastify";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@/validation/auth.validation";
import { useAuthStore } from "@/lib/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

const ProfileLeftPage = ({ userData, onProfileUpdated }) => {
  const fileRef = useRef(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [image, setImage] = useState(null);
  const [cropSource, setCropSource] = useState(null);
  const cropperRef = useRef(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [changePasswordPopUp, setChangePasswordPopUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { clearUser } = useAuthStore();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const preview =
    selectedPreview || userData?.profileImage || "/assets/user.png";

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) return;
    setCropSource(URL.createObjectURL(selectedFile));
    e.target.value = "";
  };

  const applyCrop = () => {
    const croppedImage = cropperRef.current?.cropper
      .getCroppedCanvas({
        width: 500,
        height: 500,
        imageSmoothingQuality: "high",
      })
      .toDataURL("image/jpeg", 0.9);
    if (!croppedImage) return;
    setImage(croppedImage);
    setSelectedPreview(croppedImage);
    URL.revokeObjectURL(cropSource);
    setCropSource(null);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Logout failed", {
          position: "bottom-right",
          autoClose: 3000,
        });
        return;
      }

      clearUser();
      await queryClient.invalidateQueries({
        queryKey: ["auth-user"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["cart"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["wishlist"],
      });
      toast.success(data.message, {
        position: "bottom-right",
        autoClose: 3000,
        transition: Bounce,
      });
      router.replace("/login");
    } catch (error) {
      toast.error("Logout failed. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  const uploadImage = async () => {
    try {
      if (!image) return;
      setImageLoading(true);

      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image,
        }),
      });

      const data = await res.json();
      if (data?.success && data.url) {
        setSelectedPreview(data.url);
        setImage(null);
        if (onProfileUpdated) onProfileUpdated(data.user);
        toast.success("Profile image updated.", {
          position: "bottom-right",
          autoClose: 2500,
          transition: Bounce,
        });
      } else {
        toast.error(data.message || "Upload failed.", {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error("Upload failed. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setImageLoading(false);
    }
  };

  const {
    reset,
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.status === "SUCCESS") {
        toast.success(result.message, {
          autoClose: 3000,
          position: "top-center",
          transition: Bounce,
        });
        router.refresh();
        router.push("/profile");
        setChangePasswordPopUp(false);
      } else {
        toast.error(result.message, {
          position: "top-center",
          autoClose: 3000,
          transition: Bounce,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Password Changes failed. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        transition: Bounce,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <aside className="bg-gray-100 rounded-xl py-4 flex items-start justify-around md:block">
        <figure className="flex items-center justify-center flex-col">
          <div className="relative inline-flex items-center justify-center">
            <Image
              src={preview}
              alt=""
              width={100}
              height={100}
              onClick={() => fileRef.current.click()}
              className="cursor-pointer active:scale-95 w-full h-auto"
              loading="eager"
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="h-8 w-8 animate-spin rounded-full border- border-green-500 border-t-transparent" />
              </div>
            )}
          </div>
          <FaCamera className="h-5 w-5 opacity-70 -mt-4 " />
          <input type="file" hidden ref={fileRef} onChange={handleFileChange} />
          <div className="flex gap-2 items-center">
            {userData?.profileImage && (
              <button className="border px-2 py-1">Remove</button>
            )}
            {image && (
              <button className="border px-2 py-1" onClick={uploadImage}>
                Change
              </button>
            )}
          </div>
          <p className="font-medium text-xl mt-3 ">{userData?.farmername}</p>
        </figure>

        <div className="flex flex-col gap-5 p-2 md:p-3">
          {userData?.role === "admin" ? (
            <Link
              href="/admin"
              className="flex gap-2 items-center justify-between font-bold cursor-pointer hover:shadow-2xl hover:shadow-[#244527] border border-[#029102] text-[#029102] px-3 py-2 rounded-md group transition-all duration-300 active:scale-95"
            >
              Go Admin Panel🧑🏻‍🔧
              <MdAdminPanelSettings className="transform transition-transform duration-300 group-hover:-translate-x-15" />
            </Link>
          ) : (
            <Link
              href={!userData?.sellerProfile ? "/profile/seller" : ""}
              className="flex gap-2 items-center justify-between font-bold cursor-pointer hover:shadow-2xl hover:shadow-[#244527] border border-[#029102] text-[#029102] px-3 py-2 rounded-md group transition-all duration-300 active:scale-95"
            >
              {userData?.role === "seller"
                ? "Verified Seller"
                : "Become Seller"}
              <MdOutlineSell className="transform transition-transform duration-300 group-hover:-translate-x-25" />
            </Link>
          )}
          {userData?.sellerProfile ? (
            <h1 className="text-xs -mt-5">
              <span className="">Status </span>
              <span className="inline-block w-2 h-2 bg-[#ff8800] rounded-full animate-pulse"></span>
              {userData.sellerStatus}
            </h1>
          ) : (
            ""
          )}
          <button
            onClick={handleLogout}
            className="flex gap-2 items-center justify-between font-bold cursor-pointer hover:shadow-2xl hover:shadow-[#652d2d] border border-[#fa6146] text-[#fa6146] px-3 py-2 rounded-md group transition-all duration-300 active:scale-95"
          >
            Log Out
            <BiLogOut className="transform transition-transform duration-600 group-hover:-translate-x-35" />
          </button>
          <button
            onClick={() => setChangePasswordPopUp(true)}
            className="flex gap-2 items-center justify-between font-bold cursor-pointer hover:shadow-2xl hover:shadow-[#652d2d] border border-[#fa6146] text-[#fa6146] px-3 py-2 rounded-md group transition-all duration-300 active:scale-95"
          >
            Change Password
            <MdPassword className="transform transition-transform duration-600 group-hover:-translate-x-15" />
          </button>
        </div>
      </aside>
      {changePasswordPopUp && (
        <div className="fixed inset-0 px-3 z-50 bg-black/70  flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl rounded-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setChangePasswordPopUp(false)}
              className="absolute top-4 right-4 text-xl text-red-400 bg-red-200 rouunded px-2 py-1 font-bold"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="old-Password">Old Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="old-password"
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Enter Old Password"
                    required
                    {...register("oldPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showOldPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.oldPassword && (
                  <p className="text-sm text-destructive">
                    {errors.oldPassword.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="new-Password">New Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter New Password"
                    required
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="confirm-new-Password">Confirm Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="confirm-new-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    required
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded bg-green-600 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-70 w-full font-semibold"
              >
                {isSubmitting ? "Changing Password" : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      )}
      {cropSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-3">
          <div className="w-full max-w-lg rounded-lg bg-white p-4">
            <h2 className="mb-3 text-lg font-bold">Crop profile photo</h2>
            <Cropper
              ref={cropperRef}
              src={cropSource}
              aspectRatio={1}
              viewMode={1}
              guides
              responsive
              autoCropArea={1}
              className="h-[min(70vh,26rem)] w-full"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(cropSource);
                  setCropSource(null);
                }}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyCrop}
                className="rounded bg-green-600 px-4 py-2 text-white"
              >
                Use photo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileLeftPage;
