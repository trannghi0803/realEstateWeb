import mongoose from "mongoose";

const timeExpressionModelSchema = new mongoose.Schema(
    {
        second: {
            type: String
        },
        minute: {
            type: String
        },
        hour: {
            type: String,
        },
        dayOfMonth: {
            type: String,
        },
        month: {
            type: String,
        },
        dayOfYear: {
            type: String,
        },
        type: {
            type: Number
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('timeExpression', timeExpressionModelSchema)
