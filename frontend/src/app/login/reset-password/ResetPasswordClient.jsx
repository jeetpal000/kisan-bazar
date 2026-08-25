"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bounce, toast } from "react-toastify";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/validation/auth.validation";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [message, setMessage] = useState("Verifying your reset link...");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsValidToken(false);
        setCheckingToken(false);
        setMessage("Reset token is missing.");
        return;
      }

      try {
        const res = await fetch(
          `/api/auth/reset-password?token=${encodeURIComponent(token)}`,
          {
            cache: "no-store",
          },
        );
        const result = await res.json();

        if (result.success) {
          setIsValidToken(true);
          setMessage("Please enter a new password for your account.");
        } else {
          setIsValidToken(false);
          setMessage(
            result.message || "This reset link is invalid or has expired.",
          );
        }
      } catch (error) {
        console.error(error);
        setIsValidToken(false);
        setMessage("Unable to verify reset link. Please try again.");
      } finally {
        setCheckingToken(false);
      }
    };

    verifyToken();
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.newPassword }),
      });
      const result = await res.json();

      if (result.success) {
        toast.success(result.message || "Password updated successfully.", {
          position: "bottom-right",
          autoClose: 3000,
          transition: Bounce,
        });
        router.push("/login");
      } else {
        toast.error(result.message || "Unable to update password.", {
          position: "bottom-right",
          autoClose: 3000,
          transition: Bounce,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to update password. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full">
      <Header />
      <div className="mx-auto my-30 max-w-md px-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Reset Password</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent>
            {checkingToken ? (
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your reset link.
              </p>
            ) : isValidToken ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("newPassword")}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      required
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
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-destructive">
                  The reset link is invalid or has expired.
                </p>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full cursor-pointer"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </main>
  );
}
