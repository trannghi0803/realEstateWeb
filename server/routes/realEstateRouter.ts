import { Document } from 'mongoose';
import express from 'express'
import auth from '../middleware/auth';
import authAdmin from '../middleware/authAdmin';
import realEstateController from '../controllers/realEstateController';

const router = express.Router()

router
    .route("/realEstate")
    .get(realEstateController.getRealEstate)
    .post(auth, authAdmin, realEstateController.createRealEstate);
router
    .route("/realEstate/:id")
    .get(realEstateController.getDetail)
    .delete(auth, authAdmin, realEstateController.deleteRealEstate)
    .put(auth, authAdmin, realEstateController.updateRealEstate);

export default router;