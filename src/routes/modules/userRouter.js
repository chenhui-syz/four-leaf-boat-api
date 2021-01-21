import Router from 'koa-router'
import userController from '../../api/UserController'

const router = new Router()

router.prefix('/user')

// 用户签到
router.get('/fav', userController.userSign)
// 更新用户的基本信息
router.post('/basic', userController.updateUserInfo)

// 获取历史消息
router.get('/getmsg', userController.getMsg)


export default router