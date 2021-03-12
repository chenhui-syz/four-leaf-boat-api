import path from 'path'
const DB_URL = 'mongodb://121.4.194.129:27017/mongo'
const REDIS = {
  host: '121.4.194.129',
  port: 15001,
  password: '123456'
}
const JWT_SECRET = 'a&*38QthAKuiRwISGLotgq^3%^$zvA3A6Hfr8MF$jM*HY4*dWcwAW&9NGp7*b53!'

const baseUrl = process.env.NODE_ENV === 'produciton' ? 'siyezhou.com' : 'http://localhost:8080'

const uploadPath = process.env.NODE_ENV === 'produciton' ? '/app/public' : path.join(path.resolve(__dirname), '../../public')

export default {
  DB_URL,
  REDIS,
  JWT_SECRET,
  baseUrl,
  uploadPath
}