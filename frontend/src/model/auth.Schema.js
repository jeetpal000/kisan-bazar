import { blogCategory, productCategory, productUnit, } from "@/lib/constantData";
import mongoose from "mongoose";

const SellerProfileSchema = new mongoose.Schema(
  {
    shopname: String,
    address: String,
    state: String,
    district: String,
    pincode: Number,
    bankAccountName: String,
    bankAccountNumber: Number,
    ifscCode: String,
    shopnumber: Number,
  },
  { _id: false }
);

const userAddressSchema = new mongoose.Schema({
  address: String,
  phone: String,
  name: String,
  city: String,
  district: String,
  state: String,
  pincode: Number,

}, { _id: false });

const UserSchema = new mongoose.Schema(
  {
    farmername: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    profileImage: {
      type: String,
    },

    sellerStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },

    sellerProfile: {
      type: SellerProfileSchema,
      default: null,
    },

    addresses: {
      type: userAddressSchema,
      default: null,
    },

    // Password Reset Fields
    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const UserTable =
  mongoose.models.UserTable ||
  mongoose.model("UserTable", UserSchema);





const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserTable",
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  ip: {
    type: String,
    required: true,
  },
  expireAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    index: { expires: 86400 }
  }
}, { timestamps: true });



export const SessionTable = mongoose.models.SessionTable || mongoose.model("SessionTable", SessionSchema);

const PushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserTable",
    required: true,
    index: true,
  },
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
}, { timestamps: true });

export const PushSubscriptionTable =
  mongoose.models.PushSubscriptionTable ||
  mongoose.model("PushSubscriptionTable", PushSubscriptionSchema);

const ChatMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserTable",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserTable",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true },
);

ChatMessageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });

export const ChatMessageTable =
  mongoose.models.ChatMessageTable ||
  mongoose.model("ChatMessageTable", ChatMessageSchema);


const ProductSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserTable",
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  actualPrice: {
    type: Number,
    required: true,
  },
  sellPrice: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: productCategory,
    required: true
  },
  unit: {
    type: String,
    enum: productUnit,
    required: true
  },
  imageUrls: {
    type: [String],
    required: true,
    validate: {
      validator: (value) => value.length >= 1 && value.length <= 3,
      message: "A product must have between 1 and 3 images",
    },
  },
  stock: {
    type: Number,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    required: true,
    default: true
  }

}, { timestamps: true });

export const ProductTable = mongoose.models.ProductTable || mongoose.model("ProductTable", ProductSchema);

const BlogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserTable",
    required: true,
  },
  blogName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: blogCategory,
    required: true
  },
  mediaUrls: {
    type: [{
      url: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ["image", "video"],
        required: true
      }
    }],
    required: true,
    validate: {
      validator: (val) => val.length >= 1 && val.length <= 3,
      message: "A Blog must have between 1 and 3 media items",
    }
  }
}, { timestamps: true });

export const BlogTable = mongoose.models.BlogTable || mongoose.model("BlogTable", BlogSchema)



const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserTable",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductTable",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  }
}, { timestamps: true })

export const CartTable = mongoose.models.CartTable || mongoose.model("CartTable", CartSchema);

const WishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserTable",
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductTable",
    required: true,
  },
}, { timestamps: true });

export const WishlistTable = mongoose.models.WishlistTable || mongoose.model("WishlistTable", WishlistSchema);


const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserTable",
      required: true,
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserTable",
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductTable",
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    productImage: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      district: String,
      state: String,
      pincode: Number,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Packed",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    stockRestored: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const OrderTable = mongoose.models.OrderTable ||
  mongoose.model("OrderTable", OrderSchema);