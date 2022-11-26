import { IDecodedToken } from "../config/interface";
import { ACCESS_TOKEN_SECRET } from "../utils/constants";
import Users from '../models/userModel'
import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const auth = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(400).json({ msg: "Invalid Authentication." });

    const decoded = <IDecodedToken>jwt.verify(token, ACCESS_TOKEN_SECRET)
    if (!decoded) return res.status(400).json({ msg: "Invalid Authentication!" })
    
    const user = await Users.findOne({ _id: decoded.id }).select("-password")
    if (!user) return res.status(400).json({ msg: "User does not exist." })

    req.user = user;

    next()
    // jwt.verify(token, ACCESS_TOKEN_SECRET, (err: any, user: any) => {
    //   if (err) return res.status(400).json({ msg: "Invalid Authentication!" });
    //   req.user = user;
    //   next();
    // });
  } catch (err: any) {
    res.status(500).json({ msg: err.message });
  }
};
export default auth;
