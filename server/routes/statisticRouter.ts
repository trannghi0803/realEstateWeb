import { Document } from 'mongoose';
import express from 'express'
import auth from '../middleware/auth';
import authAdmin from '../middleware/authAdmin';
import statisticController from '../controllers/statisticController';

const router = express.Router()

router.get('/statistic/countByRegion', auth, authAdmin, statisticController.countRealEstateByRegion)
router.get('/statistic/countByCategory', auth, authAdmin, statisticController.countRealEstateByCategory)
router.get('/statistic/countByUser', auth, authAdmin, statisticController.countRealEstateByUser)
router.get('/statistic/countByCreateTime', auth, authAdmin, statisticController.countRealEstateByCreateTime)
export default router;