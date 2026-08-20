"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaImage,
  FaRegEdit,
  FaVideo,
} from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdAdd } from "react-icons/md";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BlogUploadSchema } from "@/validation/blogAdd.validation";
import { blogCategory } from "@/lib/constantData";
import { Bounce, toast } from "react-toastify";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const defaultValues = {
  blogMedia: [],
  blogName: "",
  description: "",
  category: "",
};

const ProfileBlogCard = ({ blog, onBlogUploadedSuccess }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editBlogPopUp, setEditBlogPopUp] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const fileRef = useRef(null);
  const [existingMedia, setExistingMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(BlogUploadSchema), defaultValues });

  useEffect(() => {
    if (!editBlogPopUp) return;

    const initialMedia = Array.isArray(blog?.mediaUrls) ? blog.mediaUrls : [];

    reset({
      ...defaultValues,
      blogMedia: initialMedia,
      blogName: blog?.blogName || "",
      description: blog?.description || "",
      category: blog?.category || "",
    });

    setExistingMedia(initialMedia);
    setMediaFiles([]);
    setMediaPreviews(
      initialMedia.map((media) => ({
        kind: "existing",
        mediaType: media?.type === "video" ? "video" : "image",
        preview: media?.url,
        media,
      })),
    );
    setValue("blogMedia", initialMedia);
  }, [blog, editBlogPopUp, reset, setValue]);

  const mediaUrls = Array.isArray(blog?.mediaUrls) ? blog.mediaUrls : [];

  const closeEditor = () => {
    setEditBlogPopUp(false);
    setExistingMedia([]);
    setMediaFiles([]);
    setMediaPreviews([]);
    reset(defaultValues);
  };

  const handleMediaSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const totalMedia = existingMedia.length + mediaFiles.length;
    if (totalMedia >= 3) {
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

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    const maximumSizeMB = isVideo ? 100 : 10;
    const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);

    if (selectedFile.size > maxSize) {
      toast.error(
        `${isVideo ? "Video" : "Image"} size should not exceed ${maximumSizeMB}MB. Your file is ${fileSizeMB}MB`,
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
      {
        kind: "new",
        mediaType: isVideo ? "video" : "image",
        preview,
        file: selectedFile,
      },
    ];

    setMediaFiles(nextFiles);
    setMediaPreviews(nextPreviews);
    setValue("blogMedia", [...existingMedia, ...nextFiles]);
    e.target.value = "";
  };

  const removeMedia = (indexToRemove) => {
    const previewItem = mediaPreviews[indexToRemove];
    if (!previewItem) return;

    const nextPreviews = mediaPreviews.filter(
      (_, index) => index !== indexToRemove,
    );

    if (previewItem.kind === "existing") {
      const nextExistingMedia = existingMedia.filter(
        (media) => media?.url !== previewItem.media?.url,
      );
      setExistingMedia(nextExistingMedia);
      setMediaPreviews(nextPreviews);
      setValue("blogMedia", [...nextExistingMedia, ...mediaFiles]);
      return;
    }

    const nextMediaFiles = mediaFiles.filter(
      (item) => item.file !== previewItem.file,
    );
    setMediaFiles(nextMediaFiles);
    setMediaPreviews(nextPreviews);
    setValue("blogMedia", [...existingMedia, ...nextMediaFiles]);
  };

  const onSubmit = async (data) => {
    const totalMedia = existingMedia.length + mediaFiles.length;
    if (totalMedia < 1 || totalMedia > 3) {
      setError("blogMedia", {
        type: "manual",
        message: "Please keep between 1 and 3 media items",
      });
      toast.error("Please keep between 1 and 3 media items", {
        autoClose: 2500,
        transition: Bounce,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      existingMedia.forEach((media) => {
        formData.append("existingMedia", JSON.stringify(media));
      });
      mediaFiles.forEach((mediaItem) => {
        formData.append("media", mediaItem.file);
        formData.append("mediaType", mediaItem.type);
      });
      formData.append("blogName", data.blogName);
      formData.append("description", data.description);
      formData.append("category", data.category);

      const response = await fetch(`/api/blog/${blog?._id || blog?.id}`, {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Blog update failed");
      }

      closeEditor();
      onBlogUploadedSuccess?.();
      toast.success(result.message || "Blog updated successfully", {
        autoClose: 2500,
        transition: Bounce,
      });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Blog update failed", {
        autoClose: 2500,
        transition: Bounce,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mediaUrls || mediaUrls.length === 0) {
    return (
      <div className="shadow-lg hover:shadow-2xl transition-shadow duration-300 group p-2 rounded-xl h-full">
        <div className="relative w-full h-48 flex items-center justify-center bg-[#f3f3f3] rounded-xl">
          <p className="text-gray-500">No media available</p>
        </div>
        <div className="mt-4">
          <p className="font-bold text-lg text-gray-800 line-clamp-2">
            {blog.blogName}
          </p>
        </div>
      </div>
    );
  }

  const currentMedia = mediaUrls[currentIndex];
  const currentMediaUrl = currentMedia?.url;
  const currentMediaType = currentMedia?.type;

  const handlePrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? mediaUrls.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === mediaUrls.length - 1 ? 0 : prev + 1));
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/blog/${blog._id}`, {
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

      onBlogUploadedSuccess?.();

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
      <div className="shadow-lg hover:shadow-2xl transition-shadow duration-300 group p-2 rounded-xl h-full flex flex-col">
        <div className="relative w-full h-75 lg:h-72 flex items-center justify-center bg-[#f3f3f3] rounded-xl overflow-hidden mb-4">
          {currentMediaType === "video" ? (
            <video src={currentMediaUrl} className="w-full h-full" controls />
          ) : (
            <Image
              src={currentMediaUrl}
              alt={blog.blogName}
              fill
              className="object-cover transform transition-transform duration-300 group-hover:scale-110 w-full h-full"
              unoptimized
            />
          )}

          {mediaUrls.length > 1 && (
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white text-green-500 p-2 rounded-full shadow-lg transition-all active:scale-95 z-10"
              aria-label="Previous media"
            >
              <FaChevronLeft className="text-sm" />
            </button>
          )}

          {mediaUrls.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white text-green-500 p-2 rounded-full shadow-lg transition-all active:scale-95 z-10"
              aria-label="Next media"
            >
              <FaChevronRight className="text-sm" />
            </button>
          )}

          {mediaUrls.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
              {currentIndex + 1}/{mediaUrls.length}
            </div>
          )}

          {currentMediaType === "video" && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
              Video
            </div>
          )}
        </div>

        <div className="mt-2 flex-1">
          <p className="font-bold text-lg text-gray-800 line-clamp-2">
            {blog.blogName}
          </p>
          <p className="text-sm text-gray-600 line-clamp-1 mt-1">
            {blog.category}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <button
            onClick={handleDelete}
            className="flex gap-2 items-center text-white font-medium cursor-pointer hover:shadow-2xl hover:shadow-black bg-[#fc681f] px-2.5 py-2 rounded-md transition-all duration-300 active:scale-95"
          >
            <RiDeleteBinLine /> Delete
          </button>
          <button
            onClick={() => setEditBlogPopUp(true)}
            className="flex gap-2 items-center text-white font-medium cursor-pointer hover:shadow-2xl hover:shadow-black bg-[#029102] px-2.5 py-2 rounded-md transition-all duration-300 active:scale-95"
          >
            <FaRegEdit /> Edit
          </button>
        </div>
      </div>
      {editBlogPopUp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-3">
          <div className="bg-white w-full max-w-2xl rounded-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeEditor}
              className="absolute top-4 right-4 text-xl text-red-400 bg-red-200 rounded px-2 py-1 font-bold"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4">Edit Blog</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-wrap gap-3 items-center">
                {mediaPreviews.map((previewItem, index) => (
                  <div
                    key={`${previewItem.preview}-${index}`}
                    className="relative h-24 w-24 overflow-hidden rounded border border-gray-300"
                  >
                    {previewItem.mediaType === "image" ? (
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
                      {previewItem.mediaType === "image" ? (
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
                {existingMedia.length + mediaFiles.length < 3 && (
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
                <p className="text-sm text-red-500">
                  {errors.blogMedia.message}
                </p>
              )}
              <Field>
                <FieldLabel htmlFor="blogName" className="font-bold">
                  Blog Name (Title)
                </FieldLabel>
                <Input id="blogName" type="text" {...register("blogName")} />
                {errors.blogName && (
                  <p className="text-sm text-red-500">
                    {errors.blogName.message}
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
                  <p className="text-sm text-red-500">
                    {errors.category.message}
                  </p>
                )}
              </Field>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded bg-green-600 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-70 w-full font-semibold"
              >
                {isSubmitting
                  ? "Saving Blog (This may take a few minutes for videos)..."
                  : "Save Blog"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileBlogCard;
