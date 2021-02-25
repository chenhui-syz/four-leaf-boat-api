import Router from 'koa-router'
import userController from '../../api/UserController'

const router = new Router()

router.prefix('/user')

// 用户签到
router.get('/fav', userController.userSign)

// 更新用户基本信息接口
router.post('/basic', userController.updateUserInfo)

// 确认修改邮件
router.get('/reset-email', userController.updateUsername)


export default router