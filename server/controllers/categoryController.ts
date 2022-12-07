import { HttpStatus } from "../utils/enums";
import categoryModel from "../models/realEstateCategory"
import realEstateModel from "../models/realEstate"
import { IReqAuth } from "../config/interface";

const Pagination = (req: IReqAuth) => {
  let page = Number(req.query.pageNumber) * 1 || 1;
  let pageSize = Number(req.query.pageSize) * 1 || 10;
  let skip = (page - 1) * pageSize;

  return { page, pageSize, skip };
}


const categoryController = {
  getCategory: async (req: any, res: any) => {
    try {
      const category = await categoryModel.find().sort("-createdAt");
      res.json(category);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  getPaged: async (req: any, res: any, next: any) => {
    try {
      const { page, pageSize, skip } = Pagination(req)

      let query = {
        name: {
          $regex: new RegExp(req.query.name), $options: "i"
        },
      }
      const countResult = await categoryModel.find(query).count()
      const data = await categoryModel.find(query).sort("-createdAt")
        .skip((pageSize * page) - pageSize)
        .limit(pageSize)
        .exec((err, result) => {
          categoryModel.countDocuments((err, count) => {
            if (err) return next(err)
            res.json({
              result, pageNumber: page, totalPage: Math.ceil((countResult) / pageSize), totalCount: (countResult), pageSize
            });
          })
        })
      // res.json(realEstateNew);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  getDetailCategory: async (req: any, res: any) => {
    try {
      const category = await categoryModel.findById(req.params.id);
      res.json(category);
    } catch(err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  createCategory: async (req: any, res: any) => {
    try {
      //role=1 -->admin
      //chỉ admin mới có quyên thê sửa xóa
      const { name, type, description } = req.body;
      const category = await categoryModel.findOne({ name });
      console.log("category", category)
      if (category)
        return res.status(400).json({ msg: "Loại tin đăng đã tồn tại", statusCode: HttpStatus.VALIDATION });
      const newCategory = new categoryModel({ name, type, description });

      let result = await newCategory.save();
      res.json({ msg: "Đã tạo thành công loại tin đăng", statusCode: HttpStatus.SUCCESS, result });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },

  deleteCategory: async (req: IReqAuth, res: any) => {
    if (!req.user) return res.status(400).json({ msg: "Invalid Authentication." })

    if (req.user.role !== 1)
      return res.status(400).json({ msg: "Invalid Authentication." })

    try {
      const realEstate = await realEstateModel.findOne({ category: req.params.id })
      if (realEstate)
        return res.status(400).json({
          msg: "Can not delete! In this category also exist blogs.",
          statusCode: HttpStatus.VALIDATION
        })

      const category = await categoryModel.findByIdAndDelete(req.params.id);
      if (!category)
        return res.status(400).json({ msg: "Category does not exists.", statusCode: HttpStatus.VALIDATION })

      res.json({ msg: "Xóa thành công loại tin đăng", statusCode: HttpStatus.SUCCESS });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  updateCategory: async (req: any, res: any) => {
    try {
      const { name, type, description } = req.body;
      console.log("object", req.body);
      if (!name) {
        res.json({ msg: "Vui lòng nhập vào tên loại tin" });
      } else {
        await categoryModel.findOneAndUpdate(
          { _id: req.params.id },
          { name, type, description }
        );
        res.json({ msg: "Cập nhật thành công loại tin đăng", statusCode: HttpStatus.SUCCESS });
      }
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
};

export default categoryController;
