import express from 'express'
import authCtrl from '../controllers/authController'
import { validRegister } from '../middleware/valid'
import auth from '../middleware/auth';
import authAdmin from '../middleware/authAdmin';

const router = express.Router()

router.post('/register', validRegister, authCtrl.register)
router.post('/active', authCtrl.activeAccount)
router.post('/login', authCtrl.login)
router.get('/logout', authCtrl.logout)
router.get('/refreshToken', authCtrl.refreshToken)

router.get('/user/getById/:id', auth, authAdmin, authCtrl.getUserById)
router.get('/user/getAll', auth, authAdmin, authCtrl.getAllUser)
router.put('/user/updateUser/:id', auth, authAdmin, authCtrl.updateUser)
router.delete('/user/deleteUser/:id', auth, authAdmin, authCtrl.deleteUser)
router.post('/user/createUser', auth, authAdmin, authCtrl.createUser)

router.get('/user/userProfile', auth, authCtrl.getUserProfile)
router.put('/user/updateUserProfile', auth, authCtrl.updateUserProfile)
router.put('/user/forgotPassword', authCtrl.forgotPassword)
router.put('/user/changePassword', auth, authCtrl.changePassword)



export default router;