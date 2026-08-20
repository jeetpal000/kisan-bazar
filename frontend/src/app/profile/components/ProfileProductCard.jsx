"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdAdd } from "react-icons/md";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductSchema } from "@/validation/productAdd.validation";
import { productCategory, productUnit } from "@/lib/constantData";
import { Bounce, toast } from "react-toastify";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const defaultValues = {
  productImages: [],
  productName: "",
  description: "",
  actualPrice: "",
  sellPrice: "",
  category: "",
  unit: "",
  stock: "",
  isAvailable: true,
};

const ProfileProductCard = ({ product, onProductUploadedSuccess }) => {
  const [editProductPopUp, setEditProductPopUp] = useState(false);
  const fileRef = useRef(null);
  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ProductSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!editProductPopUp) return;

    const initialImages = Array.isArray(product?.imageUrls)
      ? product.imageUrls
      : [];

    reset({
      ...defaultValues,
      productImages: initialImages,
      productName: product?.productName || "",
      description: product?.description || "",
      actualPrice: product?.actualPrice ?? "",
      sellPrice: product?.sellPrice ?? "",
      category: product?.category || "",
      unit: product?.unit || "",
      stock: product?.stock ?? "",
      isAvailable: product?.isAvailable ?? true,
    });

    setExistingImages(initialImages);
    setImageFiles([]);
    setImagePreviews(
      initialImages.map((url) => ({ type: "existing", url, preview: url })),
    );
    setValue("productImages", initialImages);
  }, [editProductPopUp, product, reset, setValue]);

  const updateImageState = (nextExistingImages, nextImageFiles) => {
    setValue("productImages", [...nextExistingImages, ...nextImageFiles]);
  };

  const handleImageSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const totalImages = existingImages.length + imageFiles.length;
    if (totalImages >= 3) {
      toast.error("You can upload a maximum of 3 images", {
        autoClose: 2500,
        transition: Bounce,
      });
      e.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(selectedFile);
    const nextFiles = [...imageFiles, selectedFile];
    const nextPreviews = [
      ...imagePreviews,
      { type: "new", file: selectedFile, preview },
    ];

    setImageFiles(nextFiles);
    setImagePreviews(nextPreviews);
    updateImageState(existingImages, nextFiles);
    e.target.value = "";
  };

  const removeImage = (indexToRemove) => {
    const previewItem = imagePreviews[indexToRemove];
    if (!previewItem) return;

    const nextPreviews = imagePreviews.filter(
      (_, index) => index !== indexToRemove,
    );

    if (previewItem.type === "existing") {
      const nextExistingImages = existingImages.filter(
        (img) => img !== previewItem.url,
      );
      setExistingImages(nextExistingImages);
      setImagePreviews(nextPreviews);
      updateImageState(nextExistingImages, imageFiles);
      return;
    }

    const nextImageFiles = imageFiles.filter(
      (file) => file !== previewItem.file,
    );
    setImageFiles(nextImageFiles);
    setImagePreviews(nextPreviews);
    updateImageState(existingImages, nextImageFiles);
  };

  const closeEditor = () => {
    setEditProductPopUp(false);
    setExistingImages([]);
    setImageFiles([]);
    setImagePreviews([]);
    reset(defaultValues);
  };

  const onSubmit = async (data) => {
    const totalImages = existingImages.length + imageFiles.length;
    if (totalImages < 1) {
      setError("productImages", {
        type: "manual",
        message: "Please upload at least one image",
      });
      toast.error("Please upload at least one product image", {
        autoClose: 2500,
        transition: Bounce,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      existingImages.forEach((url) =>
        formData.append("existingImageUrls", url),
      );
      imageFiles.forEach((file) => formData.append("images", file));
      formData.append("productName", data.productName);
      formData.append("description", data.description);
      formData.append("actualPrice", data.actualPrice);
      formData.append("sellPrice", data.sellPrice);
      formData.append("category", data.category);
      formData.append("unit", data.unit);
      formData.append("stock", data.stock);
      formData.append("isAvailable", String(data.isAvailable ?? true));

      const response = await fetch(
        `/api/products/${product?._id || product?.id}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Product update failed");
      }

      closeEditor();
      onProductUploadedSuccess?.();
      toast.success(result.message || "Product updated successfully", {
        autoClose: 2500,
        transition: Bounce,
      });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Product update failed", {
        autoClose: 2500,
        transition: Bounce,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Deleted Failed", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      onProductUploadedSuccess?.();

      toast.success(data.message, {
        position: "top-right",
        autoClose: 3000,
        transition: Bounce,
      });
    } catch (error) {
      toast.error("Deleted failed. Please try again", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <>
      <div className="shadow-lg hover:shadow-2xl transition-shadow duration-300 group p-2 rounded-xl">
        <figure className="relative w-full h-75 lg:h-72 flex items-center justify-center bg-[#f3f3f3] rounded-xl overflow-hidden">
          <Image
            src={product.imageUrls?.[0] || "/assets/pipe.jpg"}
            alt={product.productName}
            fill
            className="object-contain transform transition-transform duration-300 group-hover:scale-110 rounded w-full h-auto"
            loading="eager"
          />
        </figure>
        <div className="mt-4">
          <p className="font-bold text-lg text-gray-800">
            {product.productName}
          </p>
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex flex-col">
              <b className="text-[#029102] text-xl">
                ₹{product.sellPrice}
                <span className="text-sm font-medium text-gray-400">
                  /{product.unit}
                </span>
              </b>
              <span className="text-gray-400 line-through text-sm">
                ₹{product.actualPrice}
              </span>
            </div>
            <button
              onClick={handleDelete}
              className="flex gap-2 items-center text-white font-medium cursor-pointer hover:shadow-2xl hover:shadow-black bg-[#fc681f] px-2.5 py-2 rounded-md transition-all duration-300 active:scale-95"
            >
              <RiDeleteBinLine /> Delete
            </button>
            <button
              onClick={() => setEditProductPopUp(true)}
              className="flex gap-2 items-center text-white font-medium cursor-pointer hover:shadow-2xl hover:shadow-black bg-[#029102] px-2.5 py-2 rounded-md transition-all duration-300 active:scale-95"
            >
              <FaRegEdit /> Edit
            </button>
          </div>
        </div>
      </div>

      {editProductPopUp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-3">
          <div className="bg-white w-full max-w-2xl rounded-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeEditor}
              className="absolute top-4 right-4 text-xl text-red-400 bg-red-200 rounded px-2 py-1 font-bold"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4">Edit Product</h2>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-wrap gap-3 items-center">
                {imagePreviews.map((previewItem, index) => (
                  <div
                    key={`${previewItem.preview}-${index}`}
                    className="relative h-24 w-24 overflow-hidden rounded border border-gray-300"
                  >
                    <Image
                      src={previewItem.preview}
                      alt={`Preview ${index + 1}`}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 rounded-full bg-red-500 px-1.5 text-sm font-bold text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {existingImages.length + imageFiles.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex h-24 w-24 items-center justify-center rounded border-2 border-dashed border-green-600 text-green-600"
                  >
                    <MdAdd className="text-3xl" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Existing images are shown first. Click the cross to remove one,
                then save to update the product.
              </p>
              <input
                type="file"
                hidden
                accept="image/*"
                ref={fileRef}
                onChange={handleImageSelect}
              />
              {errors.productImages && (
                <p className="text-sm text-red-500">
                  {errors.productImages.message}
                </p>
              )}
              <Field>
                <FieldLabel htmlFor="productName" className="font-bold">
                  Product Name
                </FieldLabel>
                <Input
                  id="productName"
                  type="text"
                  {...register("productName")}
                />
                {errors.productName && (
                  <p className="text-sm text-red-500">
                    {errors.productName.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="description" className="font-bold">
                  Description
                </FieldLabel>
                <textarea
                  id="description"
                  {...register("description")}
                  className="min-h-24 w-full rounded border border-green-600 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[rgba(25,230,25,0.58)]"
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field>
                  <FieldLabel htmlFor="actualPrice" className="font-bold">
                    Actual Price (MRP)
                  </FieldLabel>
                  <Input
                    id="actualPrice"
                    type="number"
                    {...register("actualPrice")}
                  />
                  {errors.actualPrice && (
                    <p className="text-sm text-red-500">
                      {errors.actualPrice.message}
                    </p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="sellPrice" className="font-bold">
                    Sell Price
                  </FieldLabel>
                  <Input
                    id="sellPrice"
                    type="number"
                    {...register("sellPrice")}
                  />
                  {errors.sellPrice && (
                    <p className="text-sm text-red-500">
                      {errors.sellPrice.message}
                    </p>
                  )}
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-2 py-4">
                <Field>
                  <FieldLabel htmlFor="category" className="font-bold">
                    Category
                  </FieldLabel>
                  <select
                    id="category"
                    {...register("category")}
                    className="h-8 rounded border border-green-600 px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-[rgba(25,230,25,0.58)]"
                  >
                    <option value="">Select Category</option>
                    {productCategory.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-500">
                      {errors.category.message}
                    </p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="unit" className="font-bold">
                    Unit
                  </FieldLabel>
                  <select
                    id="unit"
                    {...register("unit")}
                    className="h-8 rounded border border-green-600 px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-[rgba(25,230,25,0.58)]"
                  >
                    <option value="">Select Unit</option>
                    {productUnit.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {errors.unit && (
                    <p className="text-sm text-red-500">
                      {errors.unit.message}
                    </p>
                  )}
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="stock" className="font-bold">
                  Stock
                </FieldLabel>
                <Input id="stock" type="number" {...register("stock")} />
                {errors.stock && (
                  <p className="text-sm text-red-500">{errors.stock.message}</p>
                )}
              </Field>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded bg-green-600 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileProductCard;
