import send from '../config/MailConfig'
import moment from 'moment'

class LoginController {
  constructor() {}
  async login(ctx) {
    const {
      body
    } = ctx.request
    console.log('login body is', body)
    try {
      ctx.body = {
        code: 200,
        data: '',
        msg: '登陆成功',
      }
    } catch (e) {
      console.log(e)
    }
  }
  async reg(ctx) {
    const {
      body
    } = ctx.request
    console.log('reg body is', body)
    try {
      ctx.body = {
        code: 200,
        data: '',
        msg: '注册成功',
      }
    } catch (e) {
      console.log(e)
    }
  }
  async forget(ctx) {
    const {
      body
    } = ctx.request
    console.log('forget body is', body)
    try {
      // body.username -> database -> email
      let result = await send({
        code: body.code,
        expire: moment()
          .add(30, 'minutes')
          .format('YYYY-MM-DD HH:mm:ss'),
        email: body.username,
        user: 'testCount',
      })
      ctx.body = {
        code: 200,
        data: result,
        msg: '邮件发送成功',
      }
    } catch (e) {
      console.log(e)
    }
  }

}

export default new LoginController()