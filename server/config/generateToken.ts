import jwt from 'jsonwebtoken'
import { ACCESS_TOKEN_SECRET, ACTIVE_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../utils/constants'

export const generateActiveToken = (payload: object) => {
  return jwt.sign(payload, ACTIVE_TOKEN_SECRET, { expiresIn: '15m'})
}

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15d'})
}

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {expiresIn: '30d'})
}