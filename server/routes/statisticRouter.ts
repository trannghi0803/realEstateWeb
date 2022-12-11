import { Document } from 'mongoose';
import express from 'express'
import auth from '../middleware/auth';
import authAdmin from '../middleware/authAdmin';
import statisticController from '../controllers/statisticController';

const router = express.Router()

router.get('/statistic/countByRegion', auth, authAdmin, statisticController.countRealEstateByRegion)
router.get('/statistic/countByCategory', auth, authAdmin, statisticController.countRealEstateSellByCategory)
router.get('/statistic/countByRentCategory', auth, authAdmin, statisticController.countRealEstateRentByCategory)
router.get('/statistic/countByUser', auth, authAdmin, statisticController.countRealEstateByUser)
router.get('/statistic/countByCreateTime', auth, authAdmin, statisticController.countRealEstateByCreateTime)
router.get('/statistic/countAreaByCategory', auth, authAdmin, statisticController.countAreaByCategory)
router.get('/statistic/countAreaByRentCategory', auth, authAdmin, statisticController.countAreaByRentCategory)
export default router;