import {
  getValue
} from '@/config/RedisConfig';
import config from '../config/index'
import jwt from 'jsonwebtoken'

// 解析JWT中的Payload
const getJWTPayload = token => {
  return jwt.verify(token.split(' ')[1], config.JWT_SECRET)
}

// 检查验证码是否正确以及是否过期
const checkCode = async (key, value) => {
  const redisData = await getValue(key)
  if (redisData != null) {
    if (redisData.toLowerCase() === value.toLowerCase()) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

export {
  checkCode,
  getJWTPayload
}