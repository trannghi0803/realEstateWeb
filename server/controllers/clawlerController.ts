import { HttpStatus } from "../utils/enums";
import { IReqAuth } from "../config/interface";
import timeExpressionModel from "../models/timeExpressionModel";
import crawlNews from "../crawl/crawlNews";
import crawlRealEstate from "../crawl/crawlRealEstate";
import { REAL_ESTATE_URL, NEWS_URL } from "../utils/constants";


const clawlerController = {
    getTimeExpression: async (req: any, res: any) => {
        try {
            let type = req.query.type ? Number(req.query.type) : undefined;
            let query = {
               type
            }
            type === undefined && delete query["type"]
            const timeExpression = await timeExpressionModel.findOne(query);
            console.log("timeExpression", timeExpression)
            res.json(timeExpression);
        } catch (err: any) {
            return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
        }
    },
    create: async (req: any, res: any) => {
        try {
            const { month, dayOfMonth, hour, minute, second, type, dayOfYear } = req.body;
            const newData = new timeExpressionModel({ month, dayOfMonth, hour, minute, second, type, dayOfYear });

            let result = await newData.save();
            res.json({ msg: "Đã tạo thành công time expression", statusCode: HttpStatus.SUCCESS, result });
        } catch (err: any) {
            return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
        }
    },
    update: async (req: any, res: any) => {
        try {
            const { month, dayOfMonth, hour, minute, second, dayOfYear } = req.body;
            // const newData = new timeExpressionModel({ month, dayOfMonth, hour, minute, second, type, dayOfYear });
            await timeExpressionModel.findOneAndUpdate(
                { _id: req.params.id },
                { month, dayOfMonth, hour, minute, second, dayOfYear }
            );
            // let result = await newData.save();
            res.json({ msg: "Cập nhật thành công time expression", statusCode: HttpStatus.SUCCESS });
        } catch (err: any) {
            return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
        }
    },
};

// const jobCrawlRealEstateSell = nodeCron.schedule('42 2 * * *', crawlRealEstateSell, {
//     scheduled: false,
//     timezone: "Asia/Ho_Chi_Minh"
// });

// const jobCrawlNewsData = nodeCron.schedule('38 4 * * *', crawlNewsData, {
//     scheduled: false,
//     timezone: "Asia/Ho_Chi_Minh"
// });
// jobCrawlNewsData.start();
// jobCrawlRealEstateSell.start();

// const crawlRealEstateSell = async () => {
//     try {
//         let data: any
//         let Url = crawlRealEstate.getLink(REAL_ESTATE_URL);
//         Url.then((uri) => {
//             data = crawlRealEstate.saveDataToDB(uri)
//         })
//         return data
//         // await crawlRealEstate();
//     } catch (err: any) {
//         console.log("err", err)
//     }
// }
// const crawlNewsData = async () => {
//     try {
//         let data: any;
//         let url = crawlNews.getLink(NEWS_URL);
//         url.then((uri) => {
//             data = crawlNews.saveDataToDB(uri)
//         })
//         return data
//         // await crawlRealEstate();
//     } catch (err: any) {
//         console.log("err", err)
//     }
// }

export default clawlerController;
