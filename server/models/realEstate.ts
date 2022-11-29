import mongoose from 'mongoose'
import { IsHighLight, RealEstateType } from '../utils/enums';

const realEstateSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Types.ObjectId, ref: 'user' },
        title: {
            type: String,
            require: true,
        },
        address : {
            provinceName: String,
            districtName: String,
            wardName: String,
            provinceCode: String,
            districtCode: String,
            wardCode: String,
            addressLine: String
        },
        price: String,
        area: Number, //m2
        description: String,
        status: {
            type: Number,
            default: 1 // admins
        },
        attributes: String,
        images: [],
        category: { type: mongoose.Types.ObjectId, ref: 'category' },
        type: {
            type: Number,
            default: RealEstateType.Create // 
        },
        isHighLight: {
            type: Number,
            default: IsHighLight.false // 
        },
        slug: {
            type: String,
            unique: true,
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('realEstate', realEstateSchema)
