import mongoose from "mongoose";

export const CreateServer = async () => {
  console.log("URI Exists:", !!process.env.MONGODB_URI);
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    throw error;
  }
};