import { HttpStatus } from "../utils/enums";
import Users from '../models/userModel'


const authAdmin = async (req: any, res: any, next: any) => {
  try {
    //lấy thông tin user theo id
    const user = await Users.findOne({
      _id: req.user.id,
    });
    if (!user) return res.status(HttpStatus.VALIDATION).json({
      statusCode: HttpStatus.VALIDATION,
      msg: "User does not exist"
    });
    else if (user.role === 0)
      return res.status(401).json({ msg: "Admin resources access denied", statusCode: HttpStatus.AUTHORIZE });
    next();
  } catch (err: any) {
    return res.status(500).json({ msg: err.message, statusCode: HttpStatus.INTERNAL_ERROR });
  }
};

export default authAdmin;
