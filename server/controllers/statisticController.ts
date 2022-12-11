import { HttpStatus, NewsType } from "../utils/enums";
import realEstateModel from "../models/realEstate"
import { IReqAuth } from "../config/interface";
const mongoose = require('mongoose');
const Pagination = (req: IReqAuth) => {
  let page = Number(req.query.pageNumber) * 1 || 1;
  let pageSize = Number(req.query.pageSize) * 1 || 10;
  let skip = (page - 1) * pageSize;

  return { page, pageSize, skip };
}

const statisticController = {
  countRealEstateByRegion: async (req: any, res: any) => {
    try {
      let start = new Date(Number(req.query.starttime) * 1000);
      let end = new Date(Number(req.query.endTime) * 1000);
      // let query = {
      //   createdAt: { $gte: start, $lte: end }
      //   // category: new RegExp(req.query.category), $options: "i"
      // }
      // console.log("query", query)
      // const data = await realEstateModel.find(query).sort("-createdAt")
      const data = await realEstateModel.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: { _id: "$address.provinceName", count: { $sum: 1 } }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).exec((err, result) => {
        if (err) {
          console.log(err)
        } else {
          // console.log(result)
          res.status(200).json(result);
        }
      });
      // res.json(data);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  countRealEstateByCategory: async (req: any, res: any) => {
    try {
      let start = new Date(Number(req.query.starttime) * 1000);
      let end = new Date(Number(req.query.endTime) * 1000);
      const data = await realEstateModel.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            // categoryType: Number(req.query.categoryType)
          }
        },
        {
          $lookup: {
            "from": "categories",
            "localField": "category",
            "foreignField": "_id",
            "as": "category"
          }
        },
        // array -> object
        { $unwind: "$category" },
        {
          $group: {
            _id: "$category._id",
            name: { $first: "$category.name" },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: 1 } },
      ]).exec((err, result) => {
        if (err) {
          console.log(err)
        } else {
          // console.log(result)
          res.status(200).json(result);
        }
      });
      // res.json(data);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  countAreaByCategory: async (req: any, res: any) => {
    try {
      let start = new Date(Number(req.query.starttime) * 1000);
      let end = new Date(Number(req.query.endTime) * 1000);
      const data = await realEstateModel.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $lookup: {
            "from": "categories",
            "localField": "category",
            "foreignField": "_id",
            "as": "category"
          }
        },
        // array -> object
        { $unwind: "$category" },
        {
          $group: {
            _id: "$category._id",
            name: { $first: "$category.name" },
            count: { $sum: "$area" }
          }
        },
        { $sort: { count: 1 } },
      ]).exec((err, result) => {
        if (err) {
          console.log(err)
        } else {
          // console.log(result)
          res.status(200).json(result);
        }
      });
      // res.json(data);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  countRealEstateByUser: async (req: any, res: any) => {
    try {
      let start = new Date(Number(req.query.starttime) * 1000);
      let end = new Date(Number(req.query.endTime) * 1000);
      const data = await realEstateModel.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $lookup: {
            "from": "users",
            "localField": "user",
            "foreignField": "_id",
            "as": "user"
          }
        },
        // array -> object
        { $unwind: "$user" },
        {
          $group: {
            _id: "$user._id",
            name: { $first: "$user.userName" },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: 1 } },
      ]).exec((err, result) => {
        if (err) {
          console.log(err)
        } else {
          console.log(result)
          res.status(200).json(result);
        }
      });
      // res.json(data);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
  countRealEstateByCreateTime: async (req: any, res: any) => {
    try {
      let start = new Date(Number(req.query.starttime) * 1000);
      let end = new Date(Number(req.query.endTime) * 1000);
      const data = await realEstateModel.aggregate([
        // { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: 1 } },
      ]).exec((err, result) => {
        if (err) {
          console.log(err)
        } else {
          // console.log(result)
          res.status(200).json(result);
        }
      });
      // res.json(data);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
};

export default statisticController;
