import { CreateServer } from "@/utils/db";
import { NextResponse } from "next/server";
import { BlogTable } from "@/model/auth.Schema";

export async function GET(request) {
  try {
    await CreateServer();

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.max(Number(searchParams.get("limit")) || 12, 1);

    // Filters
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";


    const sort = searchParams.get("sort") || "latest";

    // Mongo query
    const query = {};

    // Search by product Name

    if (search) {
      query.blogName = {
        $regex: search,
        $options: "i",
      };
    }

    // Category Filter
    if (category) {
      query.category = category;
    }



    // Sorting
    let sortOption = {};

    switch (sort) {
      case "latest":
        sortOption = { createdAt: -1 };
        break;

      case "oldest":
        sortOption = { createdAt: 1 };
        break;

      case "nameAsc":
        sortOption = { blogName: -1 };
        break;

      case "nameDsc":
        sortOption = { blogName: 1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    };

    // Total Count
    const totalBlogs = await BlogTable.countDocuments(query);

    // Blogs
    const blogs = await BlogTable.find(query)
      .populate("userId", "farmername")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      blogs,
      pagination: {
        page: page,
        pages: Math.ceil(totalBlogs / limit),
        total: totalBlogs,
        limit,
        hasNextPage: page < Math.ceil(totalBlogs / limit),
        hasPreviousPage: page > 1,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Blog fetch error:", error);
    return NextResponse.json({
      success: false,
      message: "Server error while fetching blogs"
    }, { status: 500 });
  }
}
