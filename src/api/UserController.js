import SignRecord from '../model/SignRecord'
import {
    getJWTPayload
} from '../common/Utils.js'
import User from '../model/User'
import moment from 'dayjs'
import send from '@/config/MailConfig'
import uuid from 'uuid/dist/v4'
import jwt from 'jsonwebtoken'
import {
    setValue,
    getValue
} from '@/config/RedisConfig'
import config from '@/config'

class UserController {
    // 用户签到接口
    async userSign(ctx) {
        // 取用户的ID
        const obj = await getJWTPayload(ctx.header.authorization)
        // 查看用户上一次的签到记录
        const record = await SignRecord.findByUid(obj._id)
        // 查询出用户的基本信息
        const user = await User.findByID(obj._id)
        let newRecord = {}
        let result = ''
        // 判断签到逻辑
        if (record !== null) {
            // 有历史的签到数据
            // 判断用户上一次的签到记录的created是否与今天相同
            // 如果相同代表用户是在连续签到
            // 如果当前时间的日期与用户的上一次签到日期下班相同，说明用户已经签到
            if (moment(record.created).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
                ctx.body = {
                    code: 500,
                    favs: user.favs,
                    count: user.count,
                    lastSign: record.created,
                    msg: '用户已经签到'
                }
                // 一定要有return
                return
            } else {
                let count = user.count
                let fav = 0
                // 有上一次的签到记录，并且不与今天相同，进行连续签到的判断
                //判断签到时间
                // 第n+1天签到的时候，需要与第n天的created比较
                if (moment(record.created).format('YYYY-MM-DD') === moment().subtract(1, 'days').format('YYYY-MM-DD')) {
                    // 连续签到的积分获得逻辑
                    // 进入这个逻辑，代表用户当天已经进行了连续签到，所以count应该先加1，再去计算积分
                    count += 1
                    if (count < 5) {
                        fav = 5
                    } else if (count >= 5 && count < 15) {
                        fav = 10
                    } else if (count >= 15 && count < 30) {
                        fav = 15
                    } else if (count >= 30 && count < 100) {
                        fav = 20
                    } else if (count >= 100 && count < 365) {
                        fav = 30
                    } else if (count >= 365) {
                        fav = 50
                    }
                    await User.updateOneByID({
                        _id: obj._id
                    }, {
                        $inc: {
                            favs: fav,
                            count: 1
                        }
                    })
                    result = {
                        favs: user.favs + fav,
                        count: user.count + 1
                    }
                } else {
                    // 用户中断签到
                    fav = 5
                    await User.updateOneByID({
                        _id: obj._id
                    }, {
                        $set: {
                            favs: fav,
                            count: 1
                        }
                    })
                    result = {
                        favs: user.favs + fav,
                        count: 1
                    }
                }
                // 更新签到记录表
                newRecord = new SignRecord({
                    uid: obj._id,
                    favs: fav,
                })
                await newRecord.save()
            }
        } else {
            // 无签到数据 === > 第一次签到
            // 保存用户的签到数据
            await User.updateOneByID({
                _id: obj._id
            }, {
                // $set:设置
                $set: {
                    count: 1
                },
                // $inc是increase的缩写，原有数据+5的意思
                $inc: {
                    favs: 5
                }
            })
            // 保存用户的签到记录
            newRecord = new SignRecord({
                uid: obj._id,
                fav: 5
            })
            await newRecord.save()
            result = {
                favs: user.favs + 5,
                count: 1
            }

        }
        ctx.body = {
            code: 200,
            msg: '请求成功',
            ...result,
            lastSign: newRecord.created
        }
    }

    // 更新用户基本信息接口
    async updateUserInfo(ctx) {
        console.log('xtttttttttttttttttttttttttttttttttt')
        console.log(global.ws)
        global.ws.send(JSON.stringify({
            event:'message',
            message:'您有一条新的评论'
        }))
        const {
            body
        } = ctx.request
        const obj = await getJWTPayload(ctx.header.authorization)
        // 判断用户是否修改了邮箱
        const user = await User.findOne({
            _id: obj._id
        })
        let msg = ''
        if (body.username && body.username !== user.username) {
            // 用户修改了邮箱
            // 需要发送邮件 
            // 判断用户的新邮箱是否已经有人注册
            const tmpUser = await User.findOne({
                username: body.username
            })
            if (tmpUser && tmpUser.password) {
                ctx.nody = {
                    code: '501',
                    msg: '邮箱已经注册'
                }
                return
            }
            const key = uuid()
            setValue(key, jwt.sign({
                _id: obj._id
            }, config.JWT_SECRET, {
                expiresIn: '30m'
            }))
            const result = await send({
                // 根据type去判断邮件的具体内容
                type: 'email',
                key: key,
                data: {
                    key: key,
                    username: body.username
                },
                // 邀请码，可选
                code: '',
                // 过期时间，可选
                expire: moment()
                    .add(30, 'minutes')
                    .format('YYYY-MM-DD HH:mm:ss'),
                // 发送邮箱，必选
                email: user.username,
                // 用户的昵称，可选
                user: 'testUsername',
            })
            msg = '更新基本资料成功，账号修改需要邮件确认，请查收邮件！'
        }
        // 过滤掉下面的几处敏感信息，不允许用户随意修改
        const arr = ['username', 'mobile', 'password']
        arr.map((item) => {
            delete body[item]
        })
        const result = await User.updateOne({
            _id: obj._id
        }, body)
        if (result.n === 1 && result.ok === 1) {
            ctx.body = {
                code: 200,
                msg: msg === '' ? '更新成功' : msg
            }
        } else {
            ctx.body = {
                code: 500,
                msg: '更新失败'
            }
        }


    }

    // 更新用户名
    async updateUsername(ctx) {
        const body = ctx.query
        if (body.key) {
            const token = await getValue(body.key)
            const obj = getJWTPayload('Bearer ' + token)
            await User.updateOne({
                _id: obj._id
            }, {
                username: body.username
            })
            ctx.body = {
                code: 200,
                msg: '更新用户名成功'
            }
        }

    }
}

export default new UserController()