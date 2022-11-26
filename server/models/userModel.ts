import mongoose from "mongoose";
import { IUser } from "../config/interface";

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: [true, "Please add you userName"],
            trim: true,
            maxLength: [20, "Your name is up to 20 characters"]
        },
        email: {
            type: String,
            required: [true, "Please add you Email"],
            trim: true,
            unique: true,
        },
        phoneNumber: {
            type: String,
            required: [true, "Please add you Phone"],
            trim: true,
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Please add your password"],
            trim: true,
        },
        avatar: {
            type: String,
            default: 'https://res.cloudinary.com/tvnghidev/image/upload/v1634401475/luanvan/avatar_cugq40_hrbwqq.png',
        },
        role: {
            type: Number,
            default: 0 // admins
        },
        type: {
            type: String,
            default: 'normal' // fast
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IUser>('User', userSchema)
