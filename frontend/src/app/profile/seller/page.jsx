"use client";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { BsGraphUpArrow } from "react-icons/bs";
import { FaCubes, FaUserPlus, FaUsers } from "react-icons/fa";
import { FaBagShopping, FaPeopleRoof } from "react-icons/fa6";
import { IoStorefrontOutline } from "react-icons/io5";
import { MdOutlinePrivacyTip } from "react-icons/md";
import { TbBounceRight, TbListDetails } from "react-icons/tb";
import { VscWorkspaceTrusted } from "react-icons/vsc";
import { allState } from "@/lib/allState";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { sellerProfileSchema } from "@/validation/auth.validation";
import { useForm } from "react-hook-form";
import { Bounce, toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Page = () => {
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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sellerProfileSchema),
  });

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
  }, [register, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await fetch("/api/seller/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message || "Unable to submit seller application.", {
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
        result.message ||
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

  {
    loading && (
      <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10  border-4 rounded-full border-t-transparent border-[#2dd42d] animate-spin" />
    );
  }

  return (
    <main className="mt-18">
      <section className="grid gap-6 bg-[#00800019] px-3 py-4 sm:px-6 lg:grid-cols-[1fr_3fr] lg:gap-8">
        <div className="flex max-w-360 flex-col gap-2">
          <h1 className="text-2xl font-bold text-[green] rounded">
            Become a Seller
          </h1>
          <p className="py-2">
            Join Kisan Bazar and start selling your products to thousands
            customers
          </p>
          <div className="flex flex-col gap-3">
            <p className="flex gap-1 font-semibold">
              <TbBounceRight className="bg-[green] p-1 shrink-0 text-white h-6 w-6 rounded-full" />
              Easy to start
            </p>
            <p className="flex gap-1 font-semibold">
              <TbBounceRight className="bg-[green] p-1 shrink-0 text-white h-6 w-6 rounded-full" />
              Grow your business
            </p>
            <p className="flex gap-1 font-semibold">
              <TbBounceRight className="bg-[green] p-1 shrink-0 text-white h-6 w-6 rounded-full" />
              Trusted by farmers
            </p>
          </div>
          <Link
            href="#apply"
            className=" w-fit mt-3 flex items-center px-2 py-1 font-semibold gap-1 bg-[green] rounded cursor-pointer text-white active:scale-95 hover:-translate-y-0.5 hover:shadow-md"
          >
            <FaUserPlus />
            Apply Now
          </Link>
        </div>
        <div className="grid grid-cols-2 items-start gap-4 rounded-md border border-[#80808025] bg-[url('/assets/village2.png')] bg-cover bg-center px-2 py-3 shadow-2xs sm:grid-cols-4">
          <p className="flex flex-col gap-1 items-center">
            <FaUsers className="text-green-500 h-8 w-8" />
            <span className="text-green-500 text-xl font-bold">10K+</span>
            <span className="">Happy customers</span>
          </p>
          <p className="flex flex-col gap-1 items-center">
            <FaBagShopping className="text-green-500 h-8 w-8" />
            <span className="text-green-500 text-xl font-bold">5K+</span>
            <span className="">Active Sellers</span>
          </p>
          <p className="flex flex-col gap-1 items-center">
            <FaCubes className="text-green-500 h-8 w-8" />
            <span className="text-green-500 text-xl font-bold">25K+</span>
            <span className="">Products Sold</span>
          </p>
          <p className="flex flex-col gap-1 items-center">
            <MdOutlinePrivacyTip className="text-green-500 h-8 w-8" />
            <span className="text-green-500 text-xl font-bold">100%</span>
            <span className="">Secure Plateform</span>
          </p>
        </div>
      </section>
      <section className="">
        <h1 className="text-2xl font-bold text-center py-6">
          Why Become a Seller?
        </h1>
        <div className="grid gap-3 p-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="broder border-[#80808014] shadow-md shadow-[#00800062] flex items-center gap-2 py-2 px-4 rounded-md ">
            <FaPeopleRoof className="h-10 w-10 text-green-500 bg-[#00800013] rounded-full p-1 shrink-0 " />
            <p className="flex flex-col gap-1 ">
              <b className="">Reach More Customers</b>
              <span className="">
                Get access to thousands of active buyers accross india.
              </span>
            </p>
          </div>
          <div className="broder border-[#80808014] shadow-md shadow-[#00800062] flex items-center gap-2 py-2 px-4 rounded-md ">
            <BsGraphUpArrow className="h-10 w-10 text-green-500 bg-[#00800013] rounded-full p-1.5 shrink-0 " />
            <p className="flex flex-col gap-1 ">
              <b className="">Increase Your Profit</b>
              <span className="">
                Sell directly and earn more with better margins.
              </span>
            </p>
          </div>
          <div className="broder border-[#80808014] shadow-md shadow-[#00800062] flex items-center gap-2 py-2 px-4 rounded-md ">
            <IoStorefrontOutline className="h-10 w-10 text-green-500 bg-[#00800013] rounded-full p-1 shrink-0 " />
            <p className="flex flex-col gap-1 ">
              <b className="">Easy Store Management</b>
              <span className="">
                Manage your products, orders and customers costly.
              </span>
            </p>
          </div>
          <div className="broder border-[#80808014] shadow-md shadow-[#00800062] flex items-center gap-2 py-2 px-4 rounded-md ">
            <VscWorkspaceTrusted className="h-10 w-10 text-green-500 bg-[#00800013] rounded-full p-1 shrink-0 " />
            <p className="flex flex-col gap-1 ">
              <b className="">Secure & Trusted</b>
              <span className="">
                Secure payments and 24/7 support from our team.
              </span>
            </p>
          </div>
          <div className=""></div>
          <div className=""></div>
          <div className=""></div>
        </div>
      </section>
      {/* Seller information */}
      <section
        id="apply"
        className="grid gap-2 px-2 py-4 lg:grid-cols-[3fr_1fr]"
      >
        <div className="border bg-[#00800019] border-[#80808027] rounded-md px-2 py-4">
          <div className="flex gap-2">
            <TbListDetails className="h-8 w-8 text-green-500" />
            <p className="flex flex-col gap-1 ">
              <b className="">Seller Information</b>
              <span className="">Fill your details to apply as a seller</span>
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2 py-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="farmername" className="font-bold">
                  Farmer Name
                </FieldLabel>
                <Input
                  id="farmername"
                  type="text"
                  readOnly
                  value={userData?.farmername || ""}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone" className="font-bold">
                  Phone Number
                </FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  readOnly
                  value={userData?.phone || ""}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email" className="font-bold">
                  Email address
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  readOnly
                  value={userData?.email || ""}
                />
              </Field>
            </div>
            <div className="grid gap-2 py-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <Field>
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
            <div className="grid gap-2 py-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <Field>
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

            <div className="grid gap-2 sm:grid-cols-2">
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
              <Field>
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
              <Field>
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
            <button className=" w-fit mt-3 flex items-center px-2 py-1 font-semibold gap-1 bg-[green] rounded cursor-pointer text-white active:scale-95 hover:-translate-y-0.5 hover:shadow-md">
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
