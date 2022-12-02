import express from 'express'
const cloudinary = require("cloudinary").v2;
import auth from "../middleware/auth";
import authAdmin from "../middleware/authAdmin";
import fs from "fs";
import { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } from '../utils/constants';

const router = express.Router()
//uploadimage with cloud
cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API_KEY,
    api_secret: CLOUD_API_SECRET,
});

//uploadimage
router.post("/upload", auth, (req: any, res) => {
    try {
        console.log("ssss", typeof req.files, req.files.file);
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ msg: "Không có files để upload" });
        }
        if (req.files?.file.length > 1) {
            let res_promises = req.files?.file?.map((file: any) =>
                new Promise((resolve, reject) => {
                    cloudinary.uploader.upload(file.tempFilePath, { folder: "luanvan" }).then((result: any) => {
                        resolve(result);
                    });
                }));
            // Promise.all get imgas
            Promise.all(res_promises)
                .then(async (arrImg) => {
                    console.log("arrImg", arrImg);
                    //arrImg chính là array mà chúng ta đã upload 
                    // các bạn có thể sử dụng arrImg để save vào database, hay hơn thì sử dụng mongodb
                    res.json(arrImg)
                })
                .catch((error) => {
                    console.error('> Error>', error);
                })
        } else {
            const file: any = req.files.file;
            if (file.size > 1024 * 1024) {
                removeTmp(file.tempFilePath);
                return res.status(400).json({ msg: "file quá lớn" });
            }
            if (
                file.mimetype !== "image/jpeg" &&
                file.mimetype !== "image/png" &&
                file.mimetype !== "image/jpg"
            ) {
                removeTmp(file.tempFilePath);
                return res.status(400).json({ msg: "file không đúng định dạng" });
            }
    
            //uplaod file lên clodinary
    
            cloudinary.uploader.upload(file.tempFilePath, { folder: "luanvan" },
                async (err: any, result: any) => {
                    if (err) throw err;
                    removeTmp(file.tempFilePath);
    
                    res.json({ public_id: result.public_id, url: result.secure_url });
                }
            );
        }

        //res.json("testuplpad");
    } catch (err: any) {
        console.log("err", err);
        return res.status(500).json({ msg: err.message });
    }
});

router.post("/deleteImg", auth, (req, res) => {
    try {
        const { public_id } = req.body;
        // if (!public_id) return res.status(400).json({ msg: "No image selected" });
        cloudinary.uploader.destroy(public_id, async (err: any, result: any) => {
            if (err) throw err;
            res.json({ msg: "Deleted image" });
        });
    } catch (err: any) {
        return res.status(500).json({ msg: err.message });
    }
});

const removeTmp = (path: any) => {
    fs.unlink(path, (err) => {
        if (err) throw err;
    });
};

export default router;
