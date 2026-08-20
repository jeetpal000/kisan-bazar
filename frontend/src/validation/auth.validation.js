import z from "zod"


const passwordSchema = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "At least one uppercase letter required")
  .regex(/[a-z]/, "At least one lowercase letter required")
  .regex(/[0-9]/, "At least one number required")
  .regex(/[@$!%*?&]/, "At least one special character required");

export const loginUserSchema = z.object({
  email: z
    .string()
    .trim()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter valid email address")
    .toLowerCase(),
  password: passwordSchema
})

export const registerUserSchema = loginUserSchema.extend({
  farmername: z
    .string()
    .trim()
    .min(2, "Name at least 2 char")
    .max(255, "Name must be at most 255 characters"),

  phone: z
    .string()
    .regex(
      /^[0-9]{10}$/,
      "Phone number must be exactly 10 digits"
    ),
  confirmpassword: z
    .string()
    .trim(),
}).refine((data) => data.password === data.confirmpassword, {
  message: "Password is not matched",
  path: ["confirmpassword"]
});


export const sellerProfileSchema = z.object({
  shopname: z.string().trim().min(3),
  address: z.string().trim().min(10),

  state: z.string().min(1, "State is required"),

  district: z.string().min(1, "District is required"),

  pincode: z
    .string()
    .regex(/^[0-9]{6}$/, "Invalid pincode"),

  bankAccountName: z.string().min(3),

  bankAccountNumber: z
    .string()
    .regex(/^[0-9]{9,18}$/, "Invalid account number"),
  verifyAccountNumber: z
    .string()
    .trim(),
  ifscCode: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC"),
  shopnumber: z
    .string()
    .regex(
      /^[0-9]{10}$/,
      "Phone number must be exactly 10 digits"
    ),
}).refine((data) => data.bankAccountNumber === String(data.verifyAccountNumber), {
  message: "Bank account number not matched",
  path: ["verifyAccountNumber"]
});


export const addAddressSchema = z.object({
  address: z.string().trim().min(10),
  phone: z
    .string()
    .regex(
      /^[0-9]{10}$/,
      "Phone number must be exactly 10 digits"
    ),
  pincode: z
    .string()
    .regex(/^[0-9]{6}$/, "Invalid pincode"),
  city: z.string().min(2, "Enter valid city name").trim(),
  district: z.string().min(2, "Enter valid city name").trim(),
  state: z.string().min(2, "Enter valid state name").trim(),
  name: z.string().min(2, "Name at least 2 char").trim(),

})


export const updateProfileSchema = sellerProfileSchema.extend({
  farmername: z.string().trim().min(3, "Farmer name is required"),

  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
});



export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z
    .string()
    .trim(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New Password & Confirm Password is not matched",
  path: ["confirmPassword"]
});


export const changePasswordSchema = resetPasswordSchema.extend({
  oldPassword: z
    .string()
    .trim(),
});




