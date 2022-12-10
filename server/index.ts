require("dotenv").config();
const nodeCron = require("node-cron");
const mongoose = require("mongoose");
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import routes from './routes/index';
import crawlRealEstate from './crawl/crawlRealEstate';
import crawlNews from './crawl/crawlNews';
import { NEWS_URL, REAL_ESTATE_URL } from './utils/constants';
import timeExpressionModel from './models/timeExpressionModel';
import clawlerController from './controllers/clawlerController';
import { TimeExpressionType } from './utils/enums';
const fileUpload = require("express-fileupload");

//Middleware
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

let globals: any[] = [];

app.use('/api', routes.authRouter);
app.use('/api', routes.categoryRouter);
app.use('/api', routes.realEstateRouter);
app.use("/api/file/", routes.upload);
app.use("/api/address/", routes.province);
app.use("/api", routes.realEstateNewRouter);
app.use("/api", routes.statisticRouter);
app.use("/api", routes.timeExpressionRouter);
//Database
// import './config/database'
const connectDB = async () => {
  try {
    await mongoose.connect(
      // `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@realestate.8oi8d.mongodb.net/realestate?retryWrites=true&w=majority`,
      `mongodb+srv://tvnghidev:tvnghidev@realestate.rwji5.mongodb.net/realestate?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    // mongoose.model('User', schema);
    // const timeExpression = await timeExpressionModel.find();
    // globals = timeExpression;
    // console.log("globals", globals)
    console.log("Connect DB successfully!");
  } catch (err: any) {
    console.log("err", err.message);
    process.exit(1);
  }
};
connectDB();

const crawlRealEstateSell = async () => {
  try {
    let data: any
    let Url = crawlRealEstate.getLink(REAL_ESTATE_URL);
    Url.then((uri) => {
      data = crawlRealEstate.saveDataToDB(uri)
    })
    return data
    // await crawlRealEstate();
  } catch (err: any) {
    console.log("err", err)
  }
}
const crawlNewsData = async () => {
  try {
    let data: any;
    let url = crawlNews.getLink(NEWS_URL);
    url.then((uri) => {
      data = crawlNews.saveDataToDB(uri)
    })
    return data
    // await crawlRealEstate();
  } catch (err: any) {
    console.log("err", err)
  }
}
// crawlNewsData()
// crawlRealEstateSell()



// }
// handleException()
// let sell: any, rent: any, news: any;
// setTimeout(() => {
//   console.log("globals 2", globals)
//   const handleSetTime = () => {
//     if (globals && globals.length > 0) {
//       sell = globals.find((el: any) => el.type === TimeExpressionType.Sell)
//       rent = globals.find((el: any) => el.type === TimeExpressionType.Rent)
//       news = globals.find((el: any) => el.type === TimeExpressionType.News)
//       console.log({ sell, rent, news })
//       return {sell, rent, news}
//     }
//   }
//   handleSetTime()
// }, 30000)

// let month, dayOfMonth, hour, minute, second, dayOfYear;
      // month = data.month || '*';
      // dayOfMonth = data.dayOfMonth || '*';
      // hour = data.hour || '*';
      // minute = data.minute || '*';
      // second = data.second || '*';
      // dayOfYear = data.dayOfYear || '*';
  // `${second || '*'} ${minute || '*'} ${hour || '*'} ${dayOfMonth || '*'} ${month || '*'} ${dayOfYear || '*'}`

  // Schedule a job to run every two minutes
// const jobCrawlRealEstateSell = nodeCron.schedule(`${sell?.second || '30'} ${sell?.minute || '9'} ${sell?.hour || '*'} ${sell?.dayOfMonth || '*'} ${sell?.month || '*'} ${sell?.dayOfYear || '*'}`, crawlRealEstateSell, {
//   scheduled: false,
//   timezone: "Asia/Ho_Chi_Minh"
// });

const jobCrawlRealEstateSell = nodeCron.schedule('30 9 * * *', crawlRealEstateSell, {
  scheduled: false,
  timezone: "Asia/Ho_Chi_Minh"
});
jobCrawlRealEstateSell.start();

const jobCrawlNewsData = nodeCron.schedule('38 9 * * *', crawlNewsData, {
  scheduled: false,
  timezone: "Asia/Ho_Chi_Minh"
});
jobCrawlNewsData.start();



// server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('server listening on port', PORT);
})

