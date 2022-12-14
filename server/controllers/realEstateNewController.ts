import { HttpStatus, NewsType } from "../utils/enums";
import realEstateNewModel from "../models/realEstateNews"
import { IReqAuth } from "../config/interface";

const Pagination = (req: IReqAuth) => {
  let page = Number(req.query.pageNumber) * 1 || 1;
  let pageSize = Number(req.query.pageSize) * 1 || 10;
  let skip = (page - 1) * pageSize;

  return { page, pageSize, skip };
}

const realEstateNewController = {
  getRealEstateNew: async (req: any, res: any) => {
    try {
      const realEstateNew = await realEstateNewModel.find().sort("-createdAt");
      res.json(realEstateNew);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },

  getPagedRealEstateNew: async (req: any, res: any, next: any) => {
    try {
      const { page, pageSize, skip } = Pagination(req)

      let query = {
        title: {
          $regex: new RegExp(req.query.title), $options: "i"
        },
      }
      const countResult = await realEstateNewModel.find(query).count()
      const realEstateNew = await realEstateNewModel.find(query).sort("-createdAt")
        .skip((pageSize * page) - pageSize)
        .limit(pageSize)
        .exec((err, result) => {
          realEstateNewModel.countDocuments((err, count) => {
            if (err) return next(err)
            console.log("realEstateNewModel query", query);
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
      //ch??? admin m???i c?? quy??n th?? s???a x??a
      const { title, abstract, content, imageThumb } = req.body;
      // console.log("object", req.body);
      const realEstateNew = new realEstateNewModel({ 
        title, abstract, content, imageThumb, type: NewsType.Create
      });

      await realEstateNew.save();
      res.json({ msg: "???? t???o th??nh c??ng tin t???c", statusCode: HttpStatus.SUCCESS });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },

  deleteRealEstateNew: async (req: IReqAuth, res: any) => {
    try {
      await realEstateNewModel.findByIdAndDelete(req.params.id);
      res.json({ msg: "X??a th??nh c??ng tin t???c", statusCode: HttpStatus.SUCCESS});
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
        res.json({ msg: "C???p nh???t th??nh c??ng tin t???c", statusCode: HttpStatus.SUCCESS});
      
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },
};

export default realEstateNewController;
