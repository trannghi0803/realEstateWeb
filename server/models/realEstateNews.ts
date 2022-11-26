import mongoose from "mongoose";

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
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('realEstateNew', realEstateNewsSchema)
