import mongoose from "mongoose";
import { NewsType } from "../utils/enums";

const realEstateNewsSchema = new mongoose.Schema(
    {
        title: {
            type: String
        },
        abstract: {
            type: String
        },
        content: {
            type: String,
        },
        imageThumb: String,
        slug: {
            type: String,
            unique: true,
        },
        type: {
            type: Number,
            default: NewsType.Create // 
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('realEstateNew', realEstateNewsSchema)
