import {Document} from 'mongoose'
import { Request } from 'express'

export interface IUser extends Document {
    userName: string;
    email: string;
    phoneNumber: string;
    password: string;
    avatar: string;
    role: number;
    type: string;
    _doc: Document;
}

export interface INewUser {
    userName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
}

export interface IDecodedToken {
    id?: string;
    newUser?: INewUser
    iat?: number
    exp?: number
}

export interface IReqAuth extends Request {
    user?: IUser
}