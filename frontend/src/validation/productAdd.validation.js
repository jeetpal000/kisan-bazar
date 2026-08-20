import { productCategory, productUnit } from "@/lib/constantData";
import { z } from "zod";

export const ProductSchema = z
  .object({
    productImages: z
      .array(z.any())
      .min(1, "Please upload at least one image")
      .max(3, "You can upload up to 3 images"),
    productName: z
      .string()
      .trim()
      .min(3, "Product name must be at least 3 characters")
      .max(100, "Product name must not exceed 100 characters"),

    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description must not exceed 1000 characters"),

    actualPrice: z.coerce.number().positive("Actual price must be greater than 0"),

    sellPrice: z.coerce.number().positive("Sell price must be greater than 0"),

    category: z.enum(productCategory, {
      message: "Please select a valid category",
    }),

    unit: z.enum(productUnit, {
      message: "Please select a valid unit",
    }),

    isAvailable: z.boolean().optional().default(true),
    stock: z.coerce.number().min(1, "Stock must be at least one product"),
  })
  .refine((data) => data.sellPrice <= data.actualPrice, {
    message: "Sell price cannot be greater than actual price",
    path: ["sellPrice"],
  });