import { Request, Response, NextFunction } from 'express'

export const validRegister = async (req: Request, res: Response, next: NextFunction) => {
  const { userName, email, password, phoneNumber } = req.body

  const errors = [];

  if(!userName){
    errors.push("Please add your userName.")
  }else if(userName.length > 20){
    errors.push("Your userName is up to 20 chars long.")
  }

  if(!email){
    errors.push("Please add your email ")
  }else if(!validateEmail(email)){
    errors.push("Email format is incorrect.")
  }
  if(!phoneNumber){
    errors.push("Please add your phoneNumber ")
  }
  // else if(!validPhone(phoneNumber)){
  //   errors.push("Phone number format is incorrect.")
  // }

  if(password.length < 6){
    errors.push("Password must be at least 6 chars.")
  }

  if(errors.length > 0) return res.status(400).json({msg: errors})

  next();
}



// export function validPhone(phone: string) {
//   const re = /^[+]/g
//   return re.test(phone)
// }

export function validateEmail(email: string) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}