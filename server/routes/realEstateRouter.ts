import { Document } from 'mongoose';
import express from 'express'
import auth from '../middleware/auth';
import authAdmin from '../middleware/authAdmin';
import realEstateController from '../controllers/realEstateController';

const router = express.Router()

router.get('/realEstate/getByCategory/:categoryId', realEstateController.getRealEstateByCategory)
router.get('/realEstate/getByHighLight/:isHighLight', realEstateController.getRealEstateHighLight)
router.get('/realEstate/search', realEstateController.getRealEstateSearch)
router.get('/realEstate/waitingApprove', auth, authAdmin, realEstateController.getRealEstateWaitingApprove)
router.get('/realEstate/getByUser', auth, realEstateController.getRealEstateByUser)

router.route("/realEstate/approve/:id").put(auth, authAdmin, realEstateController.approveRealEstate)
router.route("/realEstate/reject/:id").put(auth, authAdmin, realEstateController.rejectRealEstate)

router
    .route("/realEstate")
    .get(realEstateController.getRealEstate)
    .post(auth, authAdmin, realEstateController.createRealEstate);

router
    .route("/realEstate/:id")
    .get(realEstateController.getDetail)
    .delete(auth, authAdmin, realEstateController.deleteRealEstate)
    .put(auth, authAdmin, realEstateController.updateRealEstate);
router.route("/userSubmitRealEstate/").post(auth, realEstateController.userSubmitRealEstate)
router.route("/userUpdateRealEstate/:id").put(auth, realEstateController.userUpdateRealEstate)
export default router;