import mongoose from "mongoose";
import { IUser } from "../config/interface";

const addressSchema = new mongoose.Schema(
    {
        Type: Number,
        Code: String,
        Name: String,
        AlterName: String,
        ParentId: String,
        SISID: String,
        SISPID: String,
        GeoPath: String,
        IsUrban: Number
    }
);

export default mongoose.model('address', addressSchema)
