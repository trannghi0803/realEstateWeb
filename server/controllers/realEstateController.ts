import { HttpStatus, RealEstateStatus } from "../utils/enums";
import realEstateModel from "../models/realEstate"
import { IReqAuth } from "../config/interface";
import { Request, Response } from 'express'
import { IAMAuth } from "google-auth-library";
const mongoose = require('mongoose');

const Pagination = (req: IReqAuth) => {
  let page = Number(req.query.pageNumber) * 1 || 1;
  let pageSize = Number(req.query.pageSize) * 1 || 10;
  let skip = (page - 1) * pageSize;

  return { page, pageSize, skip };
}

const realEstateController = {
  getRealEstate: async (req: any, res: any, next: any) => {
    try {
      const { page, pageSize, skip } = Pagination(req)
      let status = req.query.status !== undefined ? Number(req.query.status) : { $gt: 0 };
      //console.log("category", req.query.category);
      let provinceName = req.query.provinceName ? { $regex: new RegExp(req.query.provinceName), $options: "i" } : undefined

      let category = req.query.category ? mongoose.Types.ObjectId(req.query.category) : undefined;

      let categoryType = req.query.categoryType ? Number(req.query.categoryType) : undefined;

      let isHighLight = req.query.isHighLight ? Number(req.query.isHighLight) : undefined;
      //area
      let minArea = req.query.minArea ? Number(req.query.minArea) : undefined;
      let maxArea = req.query.maxArea ? Number(req.query.maxArea) : undefined;
      let area = (minArea && maxArea) ? { $gt: minArea, $lt: maxArea } : undefined;
      //price
      let minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
      let maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
      let price = (minPrice && maxPrice) ? { $gt: minPrice, $lt: maxPrice } : undefined;
      // let provinceName = req.query.provinceName ? {$regex: new RegExp(req.query.provinceName), $options: "i"} : undefined;
      let query = {
        status,
        title: {
          $regex: new RegExp(req.query.title), $options: "i"
        },
        category,
        categoryType,
        "address.provinceName": provinceName,
        isHighLight,
        area,
        price
        // category: new RegExp(req.query.category), $options: "i"
      }
      category === undefined && delete query["category"]
      categoryType === undefined && delete query["categoryType"]
      // status === undefined && delete query["status"]
      isHighLight === undefined && delete query["isHighLight"]
      provinceName === undefined && delete query["address.provinceName"]
      area === undefined && delete query["area"]
      price === undefined && delete query["price"]
      // query.address === undefined && delete query["address"]
      const countResult = await realEstateModel.find(query).count()
      const realEstate = await realEstateModel.find(query).sort("-createdAt")
        .skip((pageSize * page) - pageSize)
        .limit(pageSize)
        .exec((err, result) => {
          realEstateModel.countDocuments((err, count) => {
            if (err) return next(err)
            // let totalCount = result?.length

            console.log("query", query);
            res.json({
              result, pageNumber: page, totalPage: Math.ceil((countResult) / pageSize), totalCount: (countResult), pageSize
            });
          })
        })
      console.log("realEstate", realEstate);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  getRealEstateWaitingApprove: async (req: any, res: any) => {
    try {
      const realEstate = await realEstateModel.find({ status: 0 }).sort("-createdAt");
      res.json(realEstate);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  getRealEstateByUser: async (req: IReqAuth, res: any) => {
    try {
      if (!req.user) return res.status(400).json({ msg: "Invalid Authentication!!" })
      const realEstate = await realEstateModel.find({ user: req.user._id, }).sort("-createdAt");
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
      const { title, price, area, description, status, attributes, images, category, address, type, isHighLight, categoryType } = req.body;
      console.log("object", req.body);
      // let slug: string = title.trim();
      const newRealEstate = new realEstateModel({
        user: req.user._id,
        title, price, area, description, status, attributes, images, category, address, type, isHighLight, categoryType
      });

      await newRealEstate.save();
      res.json({ msg: "Đã tạo thành công bài đăng", statusCode: HttpStatus.SUCCESS });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },

  userSubmitRealEstate: async (req: IReqAuth, res: any) => {
    if (!req.user) return res.status(400).json({ msg: "Invalid Authentication!!" })
    try {
      //role=1 -->admin
      //chỉ admin mới có quyên thê sửa xóa
      const { title, price, area, description, attributes, images, category, address, type, categoryType } = req.body;
      let status: number = 0; //đang chờ duyệt
      let slug: string = title.trim();
      console.log("object", req.body);
      const newRealEstate = new realEstateModel({
        user: req.user._id, slug,
        title, price, area, description, status, attributes, images, category, address, type, categoryType
      });

      await newRealEstate.save();
      res.json({ msg: "Đã tạo thành công bài đăng", statusCode: HttpStatus.SUCCESS });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  userUpdateRealEstate: async (req: IReqAuth, res: any) => {
    if (!req.user) return res.status(400).json({ msg: "Invalid Authentication!!" })
    try {
      //role=1 -->admin
      //chỉ admin mới có quyên thê sửa xóa
      const { title, price, area, status, description, attributes, images, category, address, categoryType } = req.body;
      if (status === RealEstateStatus.Active) {
        return res.status(400).json({ msg: "Bài đăng đã được duyệt, không được chỉnh sửa", statusCode: HttpStatus.VALIDATION });
      } else {
        console.log("object", req.body);
        await realEstateModel.findOneAndUpdate(
          { _id: req.params.id },
          { title, price, area, description, attributes, images, category, address, categoryType }
        );

        res.json({ msg: "Cập nhật thành công bài đăng", statusCode: HttpStatus.SUCCESS });
      }
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
      const { title, price, area, description, status, attributes, images, category, address, type, isHighLight, categoryType } = req.body;
      console.log("object", req.body);

      await realEstateModel.findOneAndUpdate(
        { _id: req.params.id },
        { title, price, area, description, status, attributes, images, category, address, type, isHighLight, categoryType }
      );
      res.json({ msg: "Cập nhật thành công tin đăng", statusCode: HttpStatus.SUCCESS });

    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },

  approveRealEstate: async (req: any, res: any) => {
    try {
      await realEstateModel.findOneAndUpdate(
        { _id: req.params.id },
        { status: RealEstateStatus.Active }
      );
      res.json({ msg: "Phê duyệt thành công tin đăng", statusCode: HttpStatus.SUCCESS });

    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  rejectRealEstate: async (req: any, res: any) => {
    try {
      await realEstateModel.findOneAndUpdate(
        { _id: req.params.id },
        { status: RealEstateStatus.Reject }
      );
      res.json({ msg: "Từ chối thành công tin đăng", statusCode: HttpStatus.SUCCESS });

    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
};

export default realEstateController;
