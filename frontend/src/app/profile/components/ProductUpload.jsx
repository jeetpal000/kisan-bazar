import React, { useRef, useState } from "react";
import { productCategory, productUnit } from "@/lib/constantData";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductSchema } from "@/validation/productAdd.validation";
import { Bounce, toast } from "react-toastify";
import { MdAdd } from "react-icons/md";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const ProductUpload = ({ setUploadProduct, onUploadSuccess }) => {
  const fileRef = useRef(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      productImages: [],
      productName: "",
      description: "",
      actualPrice: "",
      sellPrice: "",
      category: "",
      unit: "",
      isAvailable: true,
      stock: "",
    },
  });

  const handleImageSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (imageFiles.length >= 3) {
      toast.error("You can upload a maximum of 3 images", {
        autoClose: 2500,
        transition: Bounce,
      });
      e.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(selectedFile);
    const nextFiles = [...imageFiles, selectedFile];
    const nextPreviews = [...imagePreviews, { file: selectedFile, preview }];

    setImageFiles(nextFiles);
    setImagePreviews(nextPreviews);
    setValue("productImages", nextFiles);
    e.target.value = "";
  };

  const removeImage = (indexToRemove) => {
    const updatedFiles = imageFiles.filter(
      (_, index) => index !== indexToRemove,
    );
    const updatedPreviews = imagePreviews.filter(
      (_, index) => index !== indexToRemove,
    );

    setImageFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
    setValue("productImages", updatedFiles);
  };

  const onSubmit = async (data) => {
    if (imageFiles.length < 1) {
      alert("Please upload at least one product image");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      imageFiles.forEach((file) => formData.append("images", file));
      formData.append("productName", data.productName);
      formData.append("description", data.description);
      formData.append("actualPrice", data.actualPrice);
      formData.append("sellPrice", data.sellPrice);
      formData.append("category", data.category);
      formData.append("unit", data.unit);
      formData.append("stock", data.stock);
      formData.append("isAvailable", String(data.isAvailable ?? true));

      const response = await fetch("/api/products/product-upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Product upload failed");
      }

      reset();
      setImageFiles([]);
      setImagePreviews([]);
      setUploadProduct(false);
      onUploadSuccess?.();
      toast.success("Product uploaded successfully" || result.message, {
        autoClose: 2500,
        transition: Bounce,
      });
    } catch (error) {
      console.error(error);
      alert(error.message || "Product upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-3">
      <div className="bg-white w-full max-w-2xl rounded-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setUploadProduct(false)}
          className="absolute top-4 right-4 text-xl text-red-400 bg-red-200 rounded px-2 py-1 font-bold"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">Upload Product</h2>

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
            {imageFiles.length < 3 && (
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
            Upload at least 1 and up to 3 images. Add more with the plus icon.
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
            <Input id="productName" type="text" {...register("productName")} />
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
              <Input id="sellPrice" type="number" {...register("sellPrice")} />
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
                <p className="text-sm text-red-500">{errors.unit.message}</p>
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
            {isSubmitting ? "Uploading..." : "Upload Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductUpload;
