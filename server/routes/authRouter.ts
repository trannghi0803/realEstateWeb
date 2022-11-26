import express from 'express'
import authCtrl from '../controllers/authController'
import { validRegister } from '../middleware/valid'

const router = express.Router()

router.post('/register', validRegister, authCtrl.register)
router.post('/active', authCtrl.activeAccount)
router.post('/login', authCtrl.login)
router.get('/logout', authCtrl.logout)
router.get('/refreshToken', authCtrl.refreshToken)


export default router;