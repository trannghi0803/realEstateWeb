import { Request, Response } from 'express'
import Users from '../models/userModel'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { generateAccessToken, generateActiveToken, generateRefreshToken } from '../config/generateToken'
import sendMail from '../config/sendMail'
import { validateEmail } from '../middleware/valid'
import { IDecodedToken, IUser } from '../config/interface'
import { HttpStatus } from '../utils/enums'
import { ACTIVE_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../utils/constants'
require('dotenv').config()


const CLIENT_URL = "http://localhost:3000"
// const CLIENT_URL = `${process.env.BASE_URL}`

const authCtrl = {
  register: async (req: Request, res: Response) => {
    try {
      const { userName, email, password, phoneNumber } = req.body

      const user = await Users.findOne({ email })
      if (user) return res.status(400).json({ msg: 'Email already exists.' })

      const passwordHash = await bcrypt.hash(password, 12)

      const newUser = new Users({ email, userName, password: passwordHash, phoneNumber })

      const active_token = generateActiveToken({ newUser })

      const url = `${CLIENT_URL}/active/${active_token}`

      //save mongodb
      await newUser.save();
      res.json({ msg: 'Tài khoản đã được kích hoạt' })
      // if (validateEmail(email)) {
      //   sendMail(email, url, "Verify your email address")
      //   return res.json({
      //     msg: "Success! Please check your email.",
      //   })
      // }

    } catch (err: any) {
      return res.status(HttpStatus.INTERNAL_ERROR).json({ msg: err.message })
    }
  },
  activeAccount: async (req: Request, res: Response) => {
    try {
      const { active_token } = req.body;
      const decoded = <IDecodedToken>jwt.verify(active_token, ACTIVE_TOKEN_SECRET)
      console.log("decoded----->", decoded);
      const { newUser } = decoded;
      if (!newUser) return res.status(400).json({ msg: 'Invalid authentication' })
      const user = new Users(newUser);
      console.log("user----->", user);
      await user.save();
      res.json({ msg: 'Tài khoản đã được kích hoạt' })

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
        msg: "User does not exist"
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
  refreshToken: async(req: Request, res: Response) => {
    try {
      const rf_token = req.cookies.refreshToken;
      console.log("rf_token", rf_token)
      if (!rf_token) return res.status(HttpStatus.VALIDATION).json({ msg: "Please login or regisster!" });
        const decoded = <IDecodedToken>jwt.verify(rf_token, REFRESH_TOKEN_SECRET)
          console.log("decoded", decoded);
          if(!decoded) return res.status(HttpStatus.VALIDATION).json({ msg: "Please login or regisster!" });

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

}
const loginUser = async (user: IUser, password: string, res: Response) => {
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(HttpStatus.VALIDATION).json({
    statusCode: HttpStatus.VALIDATION,
    msg: "Password is incorrect"
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