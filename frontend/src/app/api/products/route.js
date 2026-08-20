// import { ProductTable } from "@/model/auth.Schema";
// import { CreateServer } from "@/utils/db";
// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     await CreateServer();

//     const products = await ProductTable.find()
//       .populate("userId", "farmername")
//       .sort({ createdAt: -1 });

//     return NextResponse.json({
//       success: true,
//       products
//     }, { status: 200 });
//   } catch (error) {
//     console.error("Blog fetch error:", error);
//     return NextResponse.json({
//       success: false,
//       message: "Server error while fetching blogs"
//     }, { status: 500 });
//   }

// }


import { ProductTable } from "@/model/auth.Schema";
import { CreateServer } from "@/utils/db";
import { NextResponse } from "next/server";

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
    const min = searchParams.get("min");
    const max = searchParams.get("max");
    const sort = searchParams.get("sort") || "latest";

    // Mongo Query
    const query = {};

    // Search by product name
    if (search) {
      query.productName = {
        $regex: search,
        $options: "i",
      };
    }

    // Category Filter
    if (category) {
      query.category = category;
    }

    // Price Filter
    if (min || max) {
      query.sellPrice = {};

      if (min) {
        query.sellPrice.$gte = Number(min);
      }

      if (max) {
        query.sellPrice.$lte = Number(max);
      }
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

      case "price-asc":
        sortOption = { sellPrice: 1 };
        break;

      case "price-desc":
      case "price-dsc":
        sortOption = { sellPrice: -1 };
        break;

      case "nameAsc":
        sortOption = { productName: 1 };
        break;

      case "nameDesc":
        sortOption = { productName: -1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    // Total Count
    const totalProducts = await ProductTable.countDocuments(query);

    // Products
    const products = await ProductTable.find(query)
      .populate("userId", "sellerProfile")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        products,
        pagination: {
          page: page,
          pages: Math.ceil(totalProducts / limit),
          total: totalProducts,
          limit,
          hasNextPage: page < Math.ceil(totalProducts / limit),
          hasPreviousPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error while fetching products",
      },
      { status: 500 }
    );
  }
}