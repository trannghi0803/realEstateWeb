import { HttpStatus } from "../utils/enums";
import realEstateModel from "../models/realEstate"
import { IReqAuth } from "../config/interface";
import categoryModel from "../models/realEstateCategory"

// class APIfeatures {
//   constructor(query: any, queryString: any) {
//     this.query = query;
//     this.queryString = queryString;
//   }

//   filtering() {
//     const queryOjb = { ...this.queryString }; //queryString = req.query
//     // console.log({ before: queryOjb }); //before delete page

//     const excludedFields = ["page", "sort", "limit"];
//     excludedFields.forEach((el) => delete queryOjb[el]);

//     // console.log({ after: queryOjb }); //after delete page

//     let queryStr = JSON.stringify(queryOjb);
//     queryStr = queryStr.replace(
//       /\b(gte|gt|lt|lte|regex)\b/g,
//       (match) => "$" + match
//     );
//     // console.log({ queryStr });

//     this.query.find(JSON.parse(queryStr));
//     return this;
//   }

//   sorting() {
//     if (this.queryString.sort) {
//       const sortBy = this.queryString.sort.split(",").join(" ");
//       this.query = this.query.sort(sortBy);
//     } else {
//       this.query = this.query.sort("-createdAt");
//     }
//     return this;
//   }

//   paginating() {
//     const page = this.queryString.page * 1 || 1;
//     const limit = this.queryString.limit * 1 || 12;
//     const skip = (page - 1) * limit;
//     this.query = this.query.skip(skip).limit(limit);
//     return this;
//   }
// }

const realEstateController = {
  getRealEstate: async (req: any, res: any) => {
    try {
      const realEstate = await realEstateModel.find().sort("-createdAt");
      res.json(realEstate);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  getDetail: async (req: any, res: any) => {
    try {
      const realEstate = await realEstateModel.findById(req.params.id);
      // const category = await categoryModel.findById(realEstate.category);
      // // console.log("category", category);
      // // realEstate.categoryName = category.name;
      // data = {...realEstate, categoryName: category.name}
      // console.log("data", data);
      res.json(realEstate);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  createRealEstate: async (req: IReqAuth, res: any) => {
    if (!req.user) return res.status(400).json({ msg: "Invalid Authentication!!" })
    try {
      //role=1 -->admin
      //chỉ admin mới có quyên thê sửa xóa
      const { title, price, area, description, status, attributes, images, category, address, type, isHighLight } = req.body;
      console.log("object", req.body);
      const newRealEstate = new realEstateModel({ 
        user: req.user._id,
        title, price, area, description, status, attributes, images, category, address, type, isHighLight
      });

      await newRealEstate.save();
      res.json({ msg: "Đã tạo thành công bài đăng", statusCode: HttpStatus.SUCCESS });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },

  deleteRealEstate: async (req: IReqAuth, res: any) => {
    try {
      await realEstateModel.findByIdAndDelete(req.params.id);
      res.json({ msg: "Xóa thành công loại tin đăng", statusCode: HttpStatus.SUCCESS});
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  updateRealEstate: async (req: any, res: any) => {
    try {
      const { title, price, area, description, status, attributes, images, category, address, type, isHighLight } = req.body;
      console.log("object", req.body);
      
        await realEstateModel.findOneAndUpdate(
          { _id: req.params.id },
          { title, price, area, description, status, attributes, images, category, address, type, isHighLight }
        );
        res.json({ msg: "Cập nhật thành công loại tin đăng", statusCode: HttpStatus.SUCCESS});
      
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
};

export default realEstateController;
