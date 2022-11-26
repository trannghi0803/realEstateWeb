require("dotenv").config();
const mongoose = require("mongoose");
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import routes from './routes/index';
import crawlRealEstate from './crawl/crawlRealEstate';
import crawlNews from './crawl/crawlNews';
import { NEWS_URL, REAL_ESTATE_URL } from './utils/constants';
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
//routes
// app.get('/', (req, res) => {
//     res.json({msg: 'Wellcome to my project'});
// })
const crawlRealEstateSell = async () => {
  try {
    let Url = crawlRealEstate.getLink(REAL_ESTATE_URL);
    Url.then((uri) => {
      let data = crawlRealEstate.saveDataToDB(uri)
    })
   // await crawlRealEstate();
  } catch (err: any) {
    console.log("err", err)
  }
} 
// crawlRealEstateSell();

// const crawlRealEstateSell = new Promise((resolve, reject) => {
//   try {
//     let Url = crawlRealEstate.getLink(REAL_ESTATE_URL);
//     Url.then((uri) => {
//       let data = crawlRealEstate.saveDataToDB(uri)
//     })
//     // await crawlRealEstate();
//   } catch (err: any) {
//     console.log("err", err)
//   }
// });
// const crawlNewsData = new Promise((resolve, reject) => {
//   try {
//     let Url = crawlNews.getLink(NEWS_URL);
//     Url.then((uri) => {
//       let data = crawlNews.saveDataToDB(uri)
//     })
//     // await crawlRealEstate();
//   } catch (err: any) {
//     console.log("err", err)
//   }
// });

const crawlNewsData = async () => {
  try {
    let Url = crawlNews.getLink(NEWS_URL);
    Url.then((uri) => {
      let data = crawlNews.saveDataToDB(uri)
    })
    // await crawlRealEstate();
  } catch (err: any) {
    console.log("err", err)
  }
} 
// crawlNewsData()

// Promise.all([crawlRealEstateSell(), crawlNewsData()]).then((values) => {
//   console.log("Success");
// });

app.use('/api', routes.authRouter);
app.use('/api', routes.categoryRouter);
app.use('/api', routes.realEstateRouter);
app.use("/api/file/", routes.upload);
app.use("/api/address/", routes.province);
app.use("/api", routes.realEstateNewRouter);
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
      console.log("Connect DB successfully!");
    } catch (err: any) {
      console.log("err",err.message);
      process.exit(1);
    }
  };
  connectDB();
  

// server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
console.log('server listening on port', PORT);
})

