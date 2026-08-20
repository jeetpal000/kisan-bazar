import { blogCategory } from "@/lib/constantData";
import { z } from "zod";
export const BlogUploadSchema = z.object({
  blogMedia: z
    .array(z.any())
    .min(1, "Please upload at least one media file (image or video)")
    .max(3, "You can upload up to 3 media files"),
  blogName: z
    .string()
    .trim()
    .min(3, "Blog name must be at least 3 characters")
    .max(100, "Blog name must not exceed 200 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Blog name must be at least  10 character")
    .max(500, "Blog name must not exceed 500 characters"),
  category: z
    .enum(blogCategory, {
      message: "Please select a valid category",
    })
});