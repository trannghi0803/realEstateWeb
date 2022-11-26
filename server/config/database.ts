const mongoose = require('mongoose'); 

const URI = process.env.MONGODB_URL;
mongoose.connect(
  `${URI}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err: any) => {
    if (err) throw err;
    console.log("Connected to MongoDB");
  }
);