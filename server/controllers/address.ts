import addressModel from "../models/addressModel";
import { GeographicAddressType, HttpStatus } from "../utils/enums";

const addressController = {
  getProvinces: async (req: any, res: any) => {
    try {
      const province = await addressModel.find({
        Type: GeographicAddressType.Province
      });
      res.json(province);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  getDistrictsByProvinceCode: async (req: any, res: any) => {
    try {
      const districts = await addressModel.find({
        Type: GeographicAddressType.District,
        ParentId: req.params.id 
      });
      res.json(districts);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  getWardsByDistrictCode: async (req: any, res: any) => {
    try {
      const wards = await addressModel.find({
        Type: GeographicAddressType.Ward,
        ParentId: req.params.id
      });
      res.json(wards);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  
};

export default addressController;
