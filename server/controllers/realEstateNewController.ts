import { HttpStatus, NewsType } from "../utils/enums";
import realEstateNewModel from "../models/realEstateNews"
import { IReqAuth } from "../config/interface";

const realEstateNewController = {
  getRealEstateNew: async (req: any, res: any) => {
    try {
      const realEstateNew = await realEstateNewModel.find().sort("-createdAt");
      res.json(realEstateNew);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  getDetail: async (req: any, res: any) => {
    try {
      const realEstateNew = await realEstateNewModel.findById(req.params.id);
      // const category = await categoryModel.findById(realEstate.category);
      // // console.log("category", category);
      // // realEstate.categoryName = category.name;
      // data = {...realEstate, categoryName: category.name}
      // console.log("data", data);
      res.json(realEstateNew);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  createRealEstateNew: async (req: IReqAuth, res: any) => {
    // if (!req.user) return res.status(400).json({ msg: "Invalid Authentication!!" })
    try {
      //role=1 -->admin
      //chỉ admin mới có quyên thê sửa xóa
      const { title, abstract, content, imageThumb } = req.body;
      // console.log("object", req.body);
      const realEstateNew = new realEstateNewModel({ 
        title, abstract, content, imageThumb, type: NewsType.Create
      });

      await realEstateNew.save();
      res.json({ msg: "Đã tạo thành công tin tức", statusCode: HttpStatus.SUCCESS });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },

  deleteRealEstateNew: async (req: IReqAuth, res: any) => {
    try {
      await realEstateNewModel.findByIdAndDelete(req.params.id);
      res.json({ msg: "Xóa thành công tin tức", statusCode: HttpStatus.SUCCESS});
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  updateRealEstateNew: async (req: any, res: any) => {
    try {
      const { title, abstract, content, imageThumb } = req.body;
      console.log("object", req.body);
      
        await realEstateNewModel.findOneAndUpdate(
          { _id: req.params.id },
          { title, abstract, content, imageThumb, type: NewsType.Create }
        );
        res.json({ msg: "Cập nhật thành công tin tức", statusCode: HttpStatus.SUCCESS});
      
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
};

export default realEstateNewController;
