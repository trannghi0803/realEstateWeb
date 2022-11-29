import { HttpStatus } from "../utils/enums";
import realEstateModel from "../models/realEstate"
import { IReqAuth } from "../config/interface";
import { Request, Response } from 'express'
const mongoose = require('mongoose');

const Pagination = (req: IReqAuth) => {
  let page = Number(req.query.page) * 1 || 1;
  let pageSize = Number(req.query.limit) * 1 || 4;
  let skip = (page - 1) * pageSize;

  return { page, pageSize, skip };
}

const realEstateController = {
  getRealEstate: async (req: any, res: any) => {
    try {
      const realEstate = await realEstateModel.find().sort("-createdAt");
      res.json(realEstate);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  // getRealEstateSearch: async (req: Request, res: Response) => {
  //   try {
  //     // var params = req.params.search;
  //     const realEstate = await realEstateModel.find({
  //       title: `/^${req.query.title}/`
  //     }).sort("-createdAt");
  //     res.json(realEstate);
  //   } catch (err: any) {
  //     return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
  //   }
  // },
  getRealEstateSearch: async (req: Request, res: Response) => {
    const { pageSize, skip } = Pagination(req)
    console.log("data", req.params)

    try {
      const Data = await realEstateModel.aggregate([
        {
          $search: {
            index: "searchText",
            autocomplete: {
              "query": `${req.query.title}`,
              "path": "title"
            }
          }
        },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
          $project: {
            title: 1,
            description: 1,
            thumbnail: 1,
            createdAt: 1
          }
        }
      ])

      const data = Data[0].totalData;
      const totalCount = Data[0].count;
      console.log("datass", Data)
      // Pagination
      let totalPage = 0;

      if (totalCount % pageSize === 0) {
        totalPage = totalCount / pageSize;
      } else {
        totalPage = Math.floor(totalCount / pageSize) + 1;
      }

      res.json({ data, totalPage, totalCount })
    } catch (err: any) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getRealEstateHighLight: async (req: Request, res: Response) => {
    const { pageSize, skip } = Pagination(req)
    console.log("data", req.params)

    try {
      const Data = await realEstateModel.aggregate([
        {
          $facet: {
            totalData: [
              {
                $match: {
                  isHighLight: Number(req.params.isHighLight)
                }
              },
              // Sorting
              { $sort: { createdAt: -1 } },
              { $skip: skip },
              { $limit: pageSize }
            ],
            totalCount: [
              {
                $match: {
                  isHighLight: Number(req.params.isHighLight)
                },
              },
              { $count: 'count' }
            ]
          }
        },
        {
          $project: {
            count: { $arrayElemAt: ["$totalCount.count", 0] },
            totalData: 1
          }
        }
      ])

      const data = Data[0].totalData;
      const totalCount = Data[0].count;
      console.log("datass", Data)
      // Pagination
      let totalPage = 0;

      if (totalCount % pageSize === 0) {
        totalPage = totalCount / pageSize;
      } else {
        totalPage = Math.floor(totalCount / pageSize) + 1;
      }

      res.json({ data, totalPage, totalCount })
    } catch (err: any) {
      return res.status(500).json({ msg: err.message })
    }
  },
  getRealEstateByCategory: async (req: Request, res: Response) => {
    const { pageSize, skip } = Pagination(req)

    try {
      const Data = await realEstateModel.aggregate([
        {
          $facet: {
            totalData: [
              {
                $match: {
                  category: mongoose.Types.ObjectId(req.params.categoryId),
                  // isHighLight: req.params.isHighLight
                }
              },
              // Sorting
              { $sort: { createdAt: -1 } },
              { $skip: skip },
              { $limit: pageSize }
            ],
            totalCount: [
              {
                $match: {
                  category: mongoose.Types.ObjectId(req.params.categoryId),
                  // isHighLight: req.params.isHighLight
                },
              },
              { $count: 'count' }
            ]
          }
        },
        {
          $project: {
            count: { $arrayElemAt: ["$totalCount.count", 0] },
            totalData: 1
          }
        }
      ])

      const data = Data[0].totalData;
      const totalCount = Data[0].count;
      console.log("data", Data)
      // Pagination
      let totalPage = 0;

      if (totalCount % pageSize === 0) {
        totalPage = totalCount / pageSize;
      } else {
        totalPage = Math.floor(totalCount / pageSize) + 1;
      }

      res.json({ data, totalPage, totalCount })
    } catch (err: any) {
      return res.status(500).json({ msg: err.message })
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
      res.json({ msg: "Xóa thành công loại tin đăng", statusCode: HttpStatus.SUCCESS });
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
      res.json({ msg: "Cập nhật thành công loại tin đăng", statusCode: HttpStatus.SUCCESS });

    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
};

export default realEstateController;
