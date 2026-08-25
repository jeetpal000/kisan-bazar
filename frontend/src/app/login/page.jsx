"use client";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaGoogle } from "react-icons/fa6";
import {
  loginUserSchema,
  registerUserSchema,
} from "../../validation/auth.validation";
import { toast, Bounce } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Page = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState();
  const [forgotPasswordPopUp, setForgotPasswordPopUp] = useState(false);
  const { setUser: setAuthUser } = useAuthStore();
  const [forgotEmail, setForgotEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isLogin ? loginUserSchema : registerUserSchema),
  });
  const onSubmitRegister = async (data) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.status === "SUCCESS") {
        toast.success(result.message, {
          position: "top-right",
          autoClose: 3000,
          transition: Bounce,
        });
        router.push("/");
      } else {
        toast.error(result.message, {
          position: "top-right",
          autoClose: 3000,
          transition: Bounce,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Registration failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitLogin = async (data) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.status === "SUCCESS") {
        toast.success(result.message, {
          position: "top-right",
          autoClose: 3000,
          transition: Bounce,
        });
        setUser(result.user);
        setAuthUser(result.user ?? null);
        queryClient.invalidateQueries({
          queryKey: ["auth-user"],
        });

        await queryClient.invalidateQueries({
          queryKey: ["cart"],
        });

        await queryClient.invalidateQueries({
          queryKey: ["wishlist"],
        });
        router.refresh();
        router.replace("/");
      } else {
        toast.error(result.message, {
          position: "top-right",
          autoClose: 3000,
          transition: Bounce,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("login failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitForgotPassword = async (e) => {
    e.preventDefault();

    if (!forgotEmail.trim()) {
      toast.error("Please enter your email address.", {
        position: "top-right",
        autoClose: 3000,
        transition: Bounce,
      });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const result = await res.json();

      if (result.success === true) {
        toast.success(
          result.message ||
            "If that account exists, a reset link has been sent.",
          {
            position: "top-right",
            autoClose: 3000,
            transition: Bounce,
          },
        );
        setForgotEmail("");
        setForgotPasswordPopUp(false);
      } else {
        toast.error(result.message, {
          position: "top-right",
          autoClose: 3000,
          transition: Bounce,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to send reset link. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative mx-auto w-full">
      <Header />
      <div className="max-w-360 mx-auto px-10 my-30 ">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-md bg-black/40">
            <div className="w-8 h-8 rounded-full border-[3px] border-white/30 border-t-green-500 animate-spin" />
          </div>
        )}
        {forgotPasswordPopUp ? (
          <Card className="w-full max-w-sm mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Reset Password
              </CardTitle>
              <CardDescription>
                Enter your email below to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmitForgotPassword}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <Input
                      key="forgot-email"
                      id="forgot-email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full cursor-pointer">
                  Send Reset Link
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                variant="link"
                className="cursor-pointer"
                onClick={() => setForgotPasswordPopUp(false)}
              >
                Back to Login
              </Button>
            </CardFooter>
          </Card>
        ) : isLogin ? (
          <Card className="w-full max-w-sm mx-auto shadow-lg hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Login to your account
              </CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
              <CardAction>
                <Button
                  variant="link"
                  className="cursor-pointer border border-[#8e8e8e58]"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  Sign Up
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitLogin)}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        onClick={() => setForgotPasswordPopUp(true)}
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        {...register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button type="submit" className="w-full cursor-pointer">
                  Login
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button variant="outline" className="w-full cursor-pointer">
                {" "}
                <FaGoogle />
                Login with Google
              </Button>
            </CardFooter>
          </Card>
        ) : (
          // Register
          <Card className="w-full max-w-sm mx-auto shadow-lg hover:shadow-2xl transtion-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Register to your account
              </CardTitle>
              <CardDescription>
                Enter your details below to login to your account
              </CardDescription>
              <CardAction>
                <Button
                  variant="link"
                  className="cursor-pointer border border-[#8e8e8e58]"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  Login
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitRegister)}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="farmername">Farmer Name</Label>
                    <Input
                      id="farmername"
                      type="text"
                      placeholder="Farmer name...."
                      required
                      {...register("farmername")}
                    />
                  </div>
                  {errors.farmername && (
                    <p className="text-sm text-destructive">
                      {errors.farmername.message}
                    </p>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="phone"
                      placeholder="9012345678"
                      required
                      {...register("phone")}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive">
                      {errors.phone.message}
                    </p>
                  )}
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        required
                        {...register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="confirmpassword">Confirm Password</Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Enter Confirm Password"
                        required
                        {...register("confirmpassword")}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {errors.confirmpassword && (
                      <p className="text-sm text-destructive">
                        {errors.confirmpassword.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button type="submit" className="w-full cursor-pointer">
                  Register
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </main>
  );
};

export default Page;
