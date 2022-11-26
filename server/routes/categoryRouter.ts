import { Document } from 'mongoose';
import express from 'express'
import categoryController from '../controllers/categoryController'
import auth from '../middleware/auth';
import authAdmin from '../middleware/authAdmin';

const router = express.Router()

router
    .route("/category")
    .get(categoryController.getCategory)
    .post(auth, authAdmin, categoryController.createCategory);
router
    .route("/category/:id")
    .delete(auth, authAdmin, categoryController.deleteCategory)
    .put(auth, authAdmin, categoryController.updateCategory)
    .get(auth, authAdmin, categoryController.getDetailCategory)

export default router;