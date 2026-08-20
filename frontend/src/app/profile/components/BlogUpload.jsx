import Image from "next/image";
import React, { useRef, useState } from "react";
import { MdAdd } from "react-icons/md";
import { blogCategory } from "@/lib/constantData";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BlogUploadSchema } from "@/validation/blogAdd.validation";
import { Bounce, toast } from "react-toastify";
import { FaVideo, FaImage } from "react-icons/fa";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const BlogUpload = ({ setUploadBlog, onUploadSuccess }) => {
  const fileRef = useRef();
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File size limits
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(BlogUploadSchema),
    defaultValues: {
      blogMedia: [],
      blogName: "",
      description: "",
      category: "",
    },
  });

  const handleMediaSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (mediaFiles.length >= 3) {
      toast.error("You can upload a maximum of 3 media items", {
        autoClose: 2500,
        transition: Bounce,
      });
      e.target.value = "";
      return;
    }

    const isVideo = selectedFile.type.startsWith("video/");
    const isImage = selectedFile.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast.error("Only image and video files are allowed", {
        autoClose: 2500,
        transition: Bounce,
      });
      e.target.value = "";
      return;
    }

    // Check file size
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
    const maxSizeMB = isVideo ? 100 : 10;

    if (selectedFile.size > maxSize) {
      toast.error(
        `${isVideo ? "Video" : "Image"} size should not exceed ${maxSizeMB}MB. Your file is ${fileSizeMB}MB`,
        {
          autoClose: 3000,
          transition: Bounce,
        },
      );
      e.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(selectedFile);
    const nextFiles = [
      ...mediaFiles,
      { file: selectedFile, type: isVideo ? "video" : "image" },
    ];
    const nextPreviews = [
      ...mediaPreviews,
      { file: selectedFile, preview, type: isVideo ? "video" : "image" },
    ];

    setMediaFiles(nextFiles);
    setMediaPreviews(nextPreviews);
    setValue("blogMedia", nextFiles);
    e.target.value = "";
  };

  const removeMedia = (indexToRemove) => {
    const updateFiles = mediaFiles.filter(
      (_, index) => index !== indexToRemove,
    );
    const updatedPreviews = mediaPreviews.filter(
      (_, index) => index !== indexToRemove,
    );

    setMediaFiles(updateFiles);
    setMediaPreviews(updatedPreviews);
    setValue("blogMedia", updateFiles);
  };

  const onSubmit = async (data) => {
    if (mediaFiles.length < 1) {
      toast.error("Please upload at least one media file (image or video)");
      return;
    }
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      mediaFiles.forEach((mediaItem) => {
        formData.append("media", mediaItem.file);
        formData.append("mediaType", mediaItem.type);
      });
      formData.append("blogName", data.blogName);
      formData.append("description", data.description);
      formData.append("category", data.category);

      const res = await fetch("/api/blog/blog-post", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Blog upload failed");
      }
      reset();
      setMediaFiles([]);
      setMediaPreviews([]);
      setUploadBlog(false);
      onUploadSuccess?.();
      toast.success("Blog uploaded successfully" || result.message, {
        autoClose: 2500,
        transition: Bounce,
      });
    } catch (error) {
      toast.error(error.message || "Blog upload failed", {
        autoClose: 2500,
        transition: Bounce,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-3">
      <div className="bg-white w-full max-w-2xl rounded-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setUploadBlog(false)}
          className="absolute top-4 right-4 text-xl text-red-400 bg-red-200 rouunded px-2 py-1 font-bold"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Upload Blog</h2>

        <form action="" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            {mediaPreviews.map((previewItem, index) => (
              <div
                key={`${previewItem.preview}-${index}`}
                className="relative h-24 w-24 overflow-hidden rounded border border-gray-300"
              >
                {previewItem.type === "image" ? (
                  <Image
                    src={previewItem.preview}
                    alt={`Preview ${index + 1}`}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <video
                    src={previewItem.preview}
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded flex items-center gap-1">
                  {previewItem.type === "image" ? (
                    <FaImage className="text-xs" />
                  ) : (
                    <FaVideo className="text-xs" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 rounded-full bg-red-500 px-1.5 text-sm font-bold text-white"
                >
                  ×
                </button>
              </div>
            ))}
            {mediaFiles.length < 3 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-24 w-24 items-center justify-center rounded border-2 border-dashed border-green-600 text-green-600"
              >
                <MdAdd className="text-3xl" />
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
            <p className="font-semibold mb-2">Upload Guidelines:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Upload 1-3 media files (images or videos)</li>
              <li>Image maximum size: 10 MB</li>
              <li>Video maximum size: 100 MB</li>
              <li>Supported formats: JPEG, PNG, GIF, MP4, WebM, etc.</li>
            </ul>
          </div>
          <input
            type="file"
            hidden
            accept="image/*, video/*"
            ref={fileRef}
            onChange={handleMediaSelect}
          />
          {errors.blogMedia && (
            <p className="text-sm text-red-500">{errors.blogMedia.message}</p>
          )}
          <Field>
            <FieldLabel htmlFor="productName" className="font-bold">
              Blog Name{"(Title)"}
            </FieldLabel>
            <Input id="productName" type="text" {...register("blogName")} />
            {errors.blogName && (
              <p className="text-sm text-red-500">{errors.blogName.message}</p>
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
              {blogCategory.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </Field>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-green-600 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-70 w-full font-semibold"
          >
            {isSubmitting
              ? "Uploading Blog (This may take a few minutes for videos)..."
              : "Upload Blog"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BlogUpload;
