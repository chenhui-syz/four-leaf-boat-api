import User from './test'
import { deleteModel } from 'mongoose'

// 增
const user = {
  name: 'brian',
  age: 30,
  email: 'brian@toimc.com'
}

const insertMethods = async () => {
  const data = new User(user)
  const result = await data.save()
  console.log(result)
}

// 查
const findMethods = async () => {
  const result = await User.find()
  console.log(result)
}

// 改
const updateMethods = async () => {
  const result = await User.updateOne({ name: 'brian' }, {
    email: 'imooc@imooc.com'
  })
  console.log(result)
}

// 删
const deleteMethods = async () => {
  const result = await User.deleteOne({ name: 'brian' })
  console.log(result)
}

updateMethods()
// 单独运行此文件的指令：npx babel-node src/model/demo.js