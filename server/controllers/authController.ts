import { PASSWORD_DEFAULT } from './../utils/constants';
import { Request, Response } from 'express'
import Users from '../models/userModel'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { generateAccessToken, generateActiveToken, generateRefreshToken } from '../config/generateToken'
import sendMail from '../config/sendMail'
import { validateEmail } from '../middleware/valid'
import { IDecodedToken, IReqAuth, IUser } from '../config/interface'
import { HttpStatus } from '../utils/enums'
import { ACTIVE_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../utils/constants'
import { constants } from 'buffer'
require('dotenv').config()


const Pagination = (req: IReqAuth) => {
  let page = Number(req.query.pageNumber) * 1 || 1;
  let pageSize = Number(req.query.pageSize) * 1 || 10;
  let skip = (page - 1) * pageSize;

  return { page, pageSize, skip };
}

const CLIENT_URL = "http://localhost:3000"
// const CLIENT_URL = `${process.env.BASE_URL}`

const authCtrl = {
  register: async (req: Request, res: Response) => {
    try {
      const { userName, email, password, phoneNumber } = req.body

      const user = await Users.findOne({ email })
      if (user) return res.status(400).json({ msg: 'Email đã tồn tại.', statusCode: HttpStatus.VALIDATION })
      const phone = await Users.findOne({ phoneNumber })
      if (phone) return res.status(400).json({ msg: 'PhoneNumber đã tồn tại.', statusCode: HttpStatus.VALIDATION })

      const passwordHash = await bcrypt.hash(password, 12)

      const newUser = new Users({ email, userName, password: passwordHash, phoneNumber })

      const active_token = generateActiveToken({ newUser })

      const url = `${CLIENT_URL}?active_token=${active_token}`
      // const url = `${CLIENT_URL}/active/${active_token}`

      //save mongodb
      // await newUser.save();
      // res.json({ msg: 'Tài khoản đã được kích hoạt' })
      if (validateEmail(email)) {
        sendMail(email, url, "Vui lòng nhấn vào đây để xác thực tài khoản của bạn!")
        return res.json({
          msg: "Success! Please check your email.",
          statusCode: HttpStatus.SUCCESS,
        })
      }

    } catch (err: any) {
      return res.status(HttpStatus.INTERNAL_ERROR).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR })
    }
  },
  activeAccount: async (req: Request, res: Response) => {
    try {
      const { active_token } = req.body;
      const decoded = <IDecodedToken>jwt.verify(active_token, ACTIVE_TOKEN_SECRET)
      console.log("decoded----->", decoded);
      const { newUser } = decoded;
      if (!newUser) return res.status(400).json({ msg: 'Invalid authentication' })

      const ExitsUser = await Users.findOne({ email: newUser.email })
      if (ExitsUser) return res.status(400).json({ msg: "Tài khoản đã tồn tại" })

      const user = new Users(newUser);
      console.log("user----->", user);
      await user.save();
      res.json({ msg: 'Tài khoản đã được kích hoạt', statusCode: HttpStatus.SUCCESS, })

    } catch (err: any) {
      console.log("error", err);
      let mesErr: any;
      if (err.code === 11000) {
        mesErr = Object.keys(err.keyValue)[0] + " already exists"
      } else {
        let name = Object.keys(err.errors)[0]
        mesErr = err.errors[`${name}`].message
      }
      return res.json({
        statusCode: HttpStatus.INTERNAL_ERROR,
        msg: mesErr
      })
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email });

      if (!user) return res.status(HttpStatus.VALIDATION).json({
        statusCode: HttpStatus.VALIDATION,
        msg: "Tài khoản không tồn tại"
      });

      loginUser(user, password, res);

    } catch (err: any) {
      return res.status(HttpStatus.INTERNAL_ERROR).json({
        statusCode: HttpStatus.INTERNAL_ERROR,
        msg: err.message
      });
    }
  },
  logout: async (req: Request, res: Response) => {
    try {
      res.clearCookie("refreshToken", { path: "/api/refreshToken" });
      return res.json({
        statusCode: HttpStatus.SUCCESS,
        msg: "Logged out"
      });
    } catch (err: any) {
      return res.status(HttpStatus.INTERNAL_ERROR).json({
        statusCode: HttpStatus.INTERNAL_ERROR,
        msg: err.message
      });;
    }
  },
  refreshToken: async (req: Request, res: Response) => {
    try {
      const rf_token = req.cookies.refreshToken;
      console.log("rf_token", rf_token)
      if (!rf_token) return res.status(HttpStatus.VALIDATION).json({ msg: "Please login or regisster!" });
      const decoded = <IDecodedToken>jwt.verify(rf_token, REFRESH_TOKEN_SECRET)
      console.log("decoded", decoded);
      if (!decoded) return res.status(HttpStatus.VALIDATION).json({ msg: "Please login or regisster!" });

      const user = await Users.findById(decoded?.id).select("-password")
      if (!user) return res.status(HttpStatus.VALIDATION).json({ msg: "This account dose not exist!" });

      const accesstoken = generateAccessToken({ id: user._id });
      console.log("user", user)
      res.status(HttpStatus.SUCCESS).json({
        statusCode: HttpStatus.SUCCESS,
        accesstoken
      });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getAllUser: async (req: any, res: Response, next: any) => {
    try {
      const { page, pageSize, skip } = Pagination(req)
      let query = {
        userName: {
          $regex: new RegExp(req.query.userName), $options: "i"
        },
      }
      const countResult = await Users.find(query).count()
      const data = await Users.find(query).sort("-createdAt").select("-password")
        .skip((pageSize * page) - pageSize)
        .limit(pageSize)
        .exec((err, result) => {
          Users.countDocuments((err, count) => {
            if (err) return next(err)
            res.json({
              result, pageNumber: page, totalPage: Math.ceil((countResult) / pageSize), 
              totalCount: (countResult), pageSize, statusCode: HttpStatus.SUCCESS
            });
          })
        })
      //tìm user theo id không hiển thị password gán vào biến user
      // const user = await Users.find().sort("-createdAt").select("-password");

      // res.json({ user, statusCode: HttpStatus.SUCCESS });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR, });
    }
  },
  getUserProfile: async (req: IReqAuth, res: Response) => {
    try {
      //tìm user theo id không hiển thị password gán vào biến user
      if (!req.user) return res.status(400).json({ msg: "Invalid Authentication!!" })
      const user = await Users.findById(req.user.id).select("-password");
      if (!user) return res.status(400).json({ msg: "User does not exist!" });
      res.json(user);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUserById: async (req: Request, res: Response) => {
    try {
      //tìm user theo id không hiển thị password gán vào biến user
      const user = await Users.findById(req.params.id).select("-password");
      if (!user) return res.status(400).json({ msg: "User does not exist!" });
      res.json({ user, statusCode: HttpStatus.SUCCESS, });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR, });
    }
  },

  updateUser: async (req: Request, res: Response) => {
    try {
      //tìm user theo id không hiển thị password gán vào biến user
      const { userName, phoneNumber, email, avatar, role } = req.body;
      let user = await Users.findOneAndUpdate(
        { _id: req.params.id },
        { userName, phoneNumber, email, avatar, role }
      );
      res.json({ user, statusCode: HttpStatus.SUCCESS, });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR, });
    }
  },

  createUser: async (req: Request, res: Response) => {
    try {

      const { userName, email, phoneNumber, avatar, role } = req.body
      // const password = PASSWORD_DEFAULT;
      const user = await Users.findOne({ email })
      if (user) return res.status(400).json({ msg: 'Email đã tồn tại.', statusCode: HttpStatus.VALIDATION })
      const phone = await Users.findOne({ phoneNumber })
      if (phone) return res.status(400).json({ msg: 'PhoneNumber đã tồn tại.', statusCode: HttpStatus.VALIDATION })

      //generate pass
      let chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let passwordLength = 8;
      let password = "";
      for (var i = 0; i <= passwordLength; i++) {
        let randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber + 1);
      }
      console.log("password", password);
      const passwordHash = await bcrypt.hash(password, 12)
      const newUser = new Users({ email, userName, password: passwordHash, phoneNumber, role, avatar })

      await newUser.save();
      // res.json({ msg: 'Tài khoản đã được kích hoạt' })
      if (validateEmail(email)) {
        sendMail(email, "", "Tài khoản của bạn đã được tạo. Đây là thông tin tài khoản của bạn", password)
        return res.json({
          msg: "Tạo tài khoản thành công. Vui lòng kiểm tra Email",
          statusCode: HttpStatus.SUCCESS,
        })
      }

      // res.json({ user, statusCode: HttpStatus.SUCCESS, });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR, });
    }
  },

  updateUserProfile: async (req: IReqAuth, res: Response) => {
    try {
      //tìm user theo id không hiển thị password gán vào biến user
      if (!req.user) return res.status(400).json({ msg: "Invalid Authentication!!" })
      const user = await Users.findById(req.user.id).select("-password");
      if (!user) return res.status(400).json({ msg: "Tài khoản không tồn tại" });
      const { userName, phoneNumber, email, avatar } = req.body;

      await Users.findOneAndUpdate(
        { _id: user._id },
        { userName, phoneNumber, email, avatar }
      );
      res.json({ msg: "Cập nhật thành công", statusCode: HttpStatus.SUCCESS, });
    } catch (err: any) {
      console.log("error", err);
      let mesErr: any;
      if (err.code === 11000) {
        switch (Object.keys(err.keyValue)[0]) {
          case 'email':
            mesErr = "Email đã tồn tại"
            break;
          case 'phoneNumber':
            mesErr = "Số điện thoại đã tồn tại"
            break;
        }
        // mesErr = Object.keys(err.keyValue)[0] + " đã tồn tại"
      } else {
        let name = Object.keys(err.errors)[0]
        mesErr = err.errors[`${name}`].message
      }
      return res.json({
        statusCode: HttpStatus.INTERNAL_ERROR,
        msg: mesErr
      })
      // return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR, });
    }
  },

  deleteUser: async (req: IReqAuth, res: any) => {
    try {
      await Users.findByIdAndDelete(req.params.id);
      res.json({ msg: "Xóa thành công tài khoản", statusCode: HttpStatus.SUCCESS });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
    }
  },

  forgotPassword: async (req: Request, res: Response) => {
    try {
      const { email } = req.body

      const user = await Users.findOne({ email })
      if (!user)
        return res.status(400).json({ msg: 'Tài khoản không tồn tại' })

      //generate pass
      let chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let passwordLength = 8;
      let password = "";
      for (var i = 0; i <= passwordLength; i++) {
        let randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber + 1);
      }
      console.log("password", password);

      const passwordHash = await bcrypt.hash(password, 12)
      await Users.findOneAndUpdate(
        { _id: user._id },
        { password: passwordHash },
      );

      if (validateEmail(email)) {
        sendMail(email, "", "Đây là email và mật khẩu mới của bạn", password)
        return res.json({ msg: "Success! Please check your email.", statusCode: HttpStatus.SUCCESS })
      }

    } catch (err: any) {
      return res.status(500).json({ msg: err.message })
    }
  },

  changePassword: async (req: IReqAuth, res: Response) => {
    try {
      if (!req.user) return res.status(400).json({ msg: "Invalid Authentication!!" })
      const user = await Users.findById(req.user.id);
      if (!user) return res.status(400).json({ msg: "Tài khoản không tồn tại" });
      const { password } = user
      
      let oldPasswordReq = req.body.password;
      let newPasswordReq = req.body.newPassword

      console.log("password", oldPasswordReq, password, newPasswordReq);
      const isMatch = await bcrypt.compare(oldPasswordReq, password)
      if(isMatch) {
        const passwordHash = await bcrypt.hash(newPasswordReq, 12)
        await Users.findOneAndUpdate(
          { _id: user._id },
          { password: passwordHash },
        );
        return res.json({ msg: "Đổi mật khẩu thành công", statusCode: HttpStatus.SUCCESS })
      } else {
        return res.json({ msg: "Mật khẩu cũ không chính xác", statusCode: HttpStatus.INTERNAL_ERROR, })
      }
    } catch (err: any) {
      return res.status(500).json({ msg: err.message })
    }
  },
}
const loginUser = async (user: IUser, password: string, res: Response) => {
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(HttpStatus.VALIDATION).json({
    statusCode: HttpStatus.VALIDATION,
    msg: "Mật khẩu không chính xác"
  });

  //Nếu đăng  hập thành công, tạo access token và fefresh token
  const accessToken = generateAccessToken({ id: user._id });
  const refreshToken = generateRefreshToken({ id: user._id });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    path: `/api/refreshToken`,
    maxAge: 1576800, //
  });

  res.json({
    statusCode: HttpStatus.SUCCESS,
    msg: 'Login successful',
    accessToken,
    user: { ...user._doc, password: '' }
  })
}


export default authCtrl;