import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import constants from "@/shared/constants";
import { Env } from "@/config/env";

// -------------------
// Interfaces
// -------------------
export interface IRole {
  code: number;
  name: string;
  const: string;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId; // Fixed: proper ObjectId type
  name: string;
  email: string;
  photo?: string;
  password: string;
  title?: string;
  roles: IRole[];
  token?: string;
  is_admin: boolean;
  last_op?: Date;
  deleted: boolean;
  suspended: boolean;
  registration_token?: {
    token?: string;
    platform?: string;
  };
  createdAt: Date; // Added for timestamps
  updatedAt: Date; // Added for timestamps

  generateToken(): Promise<IUser>;
  comparePasswords(enteredPassword: string): Promise<boolean>;
}

// -------------------
// Schema
// -------------------
const usersSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, constants.ERROR_CODES.REQUIRED],
      minlength: [1, constants.ERROR_CODES.MIN],
      maxlength: [100, constants.ERROR_CODES.MAX],
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, constants.ERROR_CODES.REQUIRED],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, constants.ERROR_CODES.EMAIL_NOT_MATCHED],
    },
    photo: {
      type: String,
    },
    password: {
      type: String,
      required: [true, constants.ERROR_CODES.REQUIRED],
      minlength: [8, constants.ERROR_CODES.MIN], // enforce raw password rules
      maxlength: [200, constants.ERROR_CODES.MAX], // allow space for bcrypt hash (~60 chars)
    },
    title: {
      type: String,
    },
    roles: {
      type: [
        {
          code: { type: Number, required: [true, constants.ERROR_CODES.REQUIRED] },
          name: { type: String, required: [true, constants.ERROR_CODES.REQUIRED] },
          const: { type: String, required: [true, constants.ERROR_CODES.REQUIRED] },
        },
      ],
      required: [true, constants.ERROR_CODES.REQUIRED],
    },
    token: {
      type: String,
    },
    is_admin: {
      type: Boolean,
      default: false,
    },
    last_op: {
      type: Date,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    suspended: {
      type: Boolean,
      default: false,
    },
    registration_token: {
      token: { type: String },
      platform: { type: String },
    },
  },
  { collection: "users", timestamps: true }
);

// -------------------
// Methods
// -------------------
usersSchema.methods.generateToken = async function (): Promise<IUser> {
  const user = this as IUser;

  const token = jwt.sign(
    {
      _id: user._id,
      updatedAt: user.updatedAt || Date.now(),
      roles: user.roles,
      email: user.email,
      is_admin: user.is_admin || false,
      name: user.name,
      photo: user.photo,
      title: user.title,
    },
    Env.secret,
    { expiresIn: Number(Env.tokenExpirationTimeInSeconds) }
  );

  console.log("token", token);

  user.token = token;
  await user.save();
  return user;
};

// Fixed: Proper typing for the pre-save hook
usersSchema.pre("save", async function (next) {
  const user = this as IUser; // Fixed: Added proper type assertion
  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    return next();
  } catch (err) {
    return next(err as Error);
  }
});

usersSchema.methods.comparePasswords = async function (enteredPassword: string): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

// -------------------
// Model
// -------------------
export const User: Model<IUser> = mongoose.model<IUser>("User", usersSchema);
