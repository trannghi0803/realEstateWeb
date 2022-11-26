import mongoose from "mongoose";
import { IUser } from "../config/interface";

const categorySchema = new mongoose.Schema(
    {
        type: {
            type: Number,
        },
        name: {
            type: String,
            required: [true, "Please add Caterogy Name"],
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('category', categorySchema)
