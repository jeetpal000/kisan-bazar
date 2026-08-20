"use client";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { allState } from "@/lib/allState";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Bounce, toast } from "react-toastify";
import { FaUserPlus } from "react-icons/fa";
import { FaArrowLeftLong } from "react-icons/fa6";
import { TbListDetails } from "react-icons/tb";
import { updateProfileSchema } from "@/validation/auth.validation";

const Page = () => {
  const { id } = useParams();
  const router = useRouter();
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const districts =
    allState.find((item) => item.state === selectedState)?.districts || [];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
  });
  console.log("validation errror", errors);

  useEffect(() => {
    register("state");
    register("district");
  }, [register]);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/userdata", { cache: "no-store" });
        if (!res.ok) return;

        const data = await res.json();
        const user = data.user;
        if (!user) return;

        setUserData(user);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (!userData?.sellerProfile) return;

    const profile = userData.sellerProfile;
    const stateValue = profile.state || "";
    const districtValue = profile.district || "";

    setSelectedState(stateValue);
    setSelectedDistrict(districtValue);
    reset({
      farmername: userData.farmername,
      email: userData.email,
      phone: userData.phone,
      shopname: profile.shopname,
      shopnumber: String(profile.shopnumber),
      address: profile.address,
      state: stateValue,
      district: districtValue,
      pincode: String(profile.pincode),
      bankAccountName: profile.bankAccountName,
      bankAccountNumber: String(profile.bankAccountNumber),
      ifscCode: profile.ifscCode,
    });
  }, [reset, userData]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/seller/apply/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message || "Unable to update your profile.", {
          position: "top-right",
          autoClose: 3000,
          transition: Bounce,
        });
        return;
      }

      toast.success(result.message || "Seller application sent successfully.", {
        position: "top-right",
        autoClose: 3000,
        transition: Bounce,
      });
      router.push("/profile");
    } catch (error) {
      toast.error(
        error?.message ||
          "Unable to submit seller application. Please try again.",
        {
          position: "top-right",
          autoClose: 3000,
          transition: Bounce,
        },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-360 mx-auto px-2 lg:px-10 ">
      <button
        className="flex items-center gap-1 border border-green-200 rounded active:scale-95 px-2 py-1 text-green-600 font-bold mt-2"
        onClick={() => router.back()}
      >
        <FaArrowLeftLong /> Back
      </button>
      <section className="py-4 px-2 ">
        <div className="border bg-[#00800019] border-[#80808027] rounded-md px-2 py-4">
          <div className="flex gap-2">
            <TbListDetails className="h-8 w-8 text-green-500" />
            <p className="flex flex-col gap-1 ">
              <b className="text-2xl">Update Your Profile</b>

              <span className="">Fill your updated details </span>
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 py-4">
              <Field>
                <FieldLabel htmlFor="farmername" className="font-bold">
                  Farmer Name
                </FieldLabel>
                <Input
                  id="farmername"
                  type="text"
                  {...register("farmername")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone" className="font-bold">
                  Phone Number
                </FieldLabel>
                <Input id="phone" type="tel" {...register("phone")} />
              </Field>
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel htmlFor="email" className="font-bold">
                  Email address
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  readOnly
                  {...register("email")}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 py-4">
              <Field>
                <FieldLabel htmlFor="shopname" className="font-bold">
                  Shop/Farm Name
                </FieldLabel>
                <Input
                  id="shopname"
                  type="text"
                  placeholder=""
                  {...register("shopname")}
                />
                {errors.shopname && (
                  <p className="text-sm text-destructive">
                    {errors.shopname.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="shopnumber" className="font-bold">
                  Shop Number
                </FieldLabel>
                <Input
                  id="shopnumber"
                  type="tel"
                  placeholder=""
                  {...register("shopnumber")}
                />
                {errors.shopname && (
                  <p className="text-sm text-destructive">
                    {errors.shopname.message}
                  </p>
                )}
              </Field>
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel htmlFor="address" className="font-bold">
                  Address
                </FieldLabel>
                <Input
                  id="address"
                  type="text"
                  placeholder=""
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">
                    {errors.address.message}
                  </p>
                )}
              </Field>
            </div>
            <div className="grid md:grid-cols-3 grid-cols-2 gap-2 py-4">
              <Field>
                <FieldLabel htmlFor="state" className="font-bold">
                  State
                </FieldLabel>
                <select
                  id="state"
                  value={selectedState}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedState(value);
                    setSelectedDistrict("");
                    setValue("state", value);
                  }}
                  className="border border-green-600 rounded focus:outline-none focus:ring-2 focus:ring-[rgba(25,230,25,0.58)] focus-visible:ring-ring/30 px-2.5 py-1 h-8"
                >
                  <option value="">Select your state</option>
                  {allState.map((item) => (
                    <option key={item.state} value={item.state}>
                      {item.state}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-sm text-destructive">
                    {errors.state.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="district" className="font-bold">
                  District
                </FieldLabel>
                <select
                  id="district"
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setValue("district", e.target.value);
                  }}
                  className="border border-green-600 rounded focus:outline-none focus:ring-2 focus:ring-[rgba(25,230,25,0.58)] focus-visible:ring-ring/30 px-2.5 py-1 h-8"
                >
                  <option value="">Select your District</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <p className="text-sm text-destructive">
                    {errors.district.message}
                  </p>
                )}
              </Field>
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel htmlFor="pincode" className="font-bold">
                  Pincode
                </FieldLabel>
                <Input
                  id="pincode"
                  type="tel"
                  placeholder=""
                  {...register("pincode")}
                />
                {errors.pincode && (
                  <p className="text-sm text-destructive">
                    {errors.pincode.message}
                  </p>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-2 grid-rows-3 md:grid-rows-2 gap-2">
              <Field>
                <FieldLabel htmlFor="bankAccountName" className="font-bold">
                  Bank Account Name
                </FieldLabel>
                <Input
                  id="bankAccountName"
                  type="text"
                  placeholder=""
                  {...register("bankAccountName")}
                />
                {errors.bankAccountName && (
                  <p className="text-sm text-destructive">
                    {errors.bankAccountName.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="IfscCode" className="font-bold">
                  Ifsc Code
                </FieldLabel>
                <Input
                  id="IfscCode"
                  type="tel"
                  placeholder=""
                  {...register("ifscCode")}
                />
                {errors.ifscCode && (
                  <p className="text-sm text-destructive">
                    {errors.ifscCode.message}
                  </p>
                )}
              </Field>
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel htmlFor="bankAccountNumber" className="font-bold">
                  Bank Account Number
                </FieldLabel>
                <Input
                  id="bankAccountNumber"
                  type="tel"
                  placeholder=""
                  {...register("bankAccountNumber")}
                />
                {errors.bankAccountNumber && (
                  <p className="text-sm text-destructive">
                    {errors.bankAccountNumber.message}
                  </p>
                )}
              </Field>
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel htmlFor="bankAccountNumber" className="font-bold">
                  Verify Account Number
                </FieldLabel>
                <Input
                  id="bankAccountNumber"
                  type="tel"
                  placeholder="Re-enter account number"
                  {...register("verifyAccountNumber")}
                />
                {errors.verifyAccountNumber && (
                  <p className="text-sm text-destructive">
                    {errors.verifyAccountNumber.message}
                  </p>
                )}
              </Field>
            </div>
            <button className=" w-1/2 mx-auto mt-5 flex items-center justify-center px-2 py-2 font-semibold gap-1 bg-[green] rounded-full cursor-pointer text-white active:scale-95 hover:-translate-y-0.5 hover:shadow-md">
              <FaUserPlus />
              Apply Now
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Page;
