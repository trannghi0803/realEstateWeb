import { Document } from 'mongoose';
import express from 'express'
import auth from '../middleware/auth';
import authAdmin from '../middleware/authAdmin';
import realEstateNewController from '../controllers/realEstateNewController';

const router = express.Router()

router
    .route("/news/getPaged")
    .get(realEstateNewController.getPagedRealEstateNew)
router
    .route("/news")
    .get(realEstateNewController.getRealEstateNew)
    .post(auth, authAdmin, realEstateNewController.createRealEstateNew);
router
    .route("/news/:id")
    .get(realEstateNewController.getDetail)
    .delete(auth, authAdmin, realEstateNewController.deleteRealEstateNew)
    .put(auth, authAdmin, realEstateNewController.updateRealEstateNew);

export default router;