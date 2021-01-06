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

UserSchema.statics = {
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