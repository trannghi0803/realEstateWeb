import { Document } from 'mongoose';
import express from 'express'
import auth from '../middleware/auth';
import authAdmin from '../middleware/authAdmin';
import clawlerController from '../controllers/clawlerController';

const router = express.Router()

router.get('/getTimeExpression', clawlerController.getTimeExpression);
router.put('/timeExpression/:id', clawlerController.update);
router.post('/timeExpression', clawlerController.create);


export default router;