import mongoose from '@/config/DBHelpler'

const Schema = mongoose.Schema

const UserSchema = new Schema({
  'username': {
    type: String
  },
  'name': {
    type: String
  },
  'password': {
    type: String
  },
})

UserSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Error: Mongoose has a duplicate key.'))
  } else {
    next(error)
  }
})

UserSchema.statics = {
  // 这个地方的返回数据屏蔽了password，username，mobile
  findByID: function (id) {
    return this.findOne({
      _id: id
    }, {
      password: 0,
      username: 0,
      mobile: 0
    })
  },
  updateOneByID: function (id, obj) {
    return this.updateOne({
      _id: id
    }, obj)
  }
}

const UserModel = mongoose.model('users', UserSchema)

export default UserModel