import express from 'express'
import addressController from '../controllers/address'


const router = express.Router()

router.get('/getProvinces', addressController.getProvinces)
router.get('/getDistrictsByProvinceCode/:id', addressController.getDistrictsByProvinceCode)
router.get('/getWardsByDistrictCode/:id', addressController.getWardsByDistrictCode)

export default router;