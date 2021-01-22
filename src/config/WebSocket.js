import {
    getJWTPayload
} from '@/common/Utils'
import WebSocket from 'ws'
// import {
//     try
// } from 'bluebird'
class WebSocketServer {
    constructor(config = {}) {
        const defaultConfig = {
            // 运行端口
            port: 3001,
            // 30秒进行一次心跳检测
            timeInterval: 30 * 1000,
            isAuth: true
        }
        // 最终的配置
        const finalConfig = {
            ...defaultConfig,
            ...config
        }
        this.wss = {}
        this.interval = finalConfig.timeInterval
        this.isAuth = finalConfig.isAuth
        this.port = finalConfig.port
        // 接受用户传递的一些官方配置
        this.options = config.options || {}

    }
    // 初始化WebSocket服务
    init() {
        this.wss = new WebSocket.Server({
            port: this.port,
            ...this.options
        })

        // 心跳检测
        // this.heartbeat()

        // 连接信息
        this.wss.on('connection', (ws) => {
            ws.isAlive = true

            ws.on('message', (msg) => this.onMessage(ws, msg))

            ws.on('close', () => this.onClose(ws))
        })
    }

    onMessage(ws, msg) {
        // 用户鉴权 => token => _id
        // 心跳监测
        // 消息发送
        const msgObj = JSON.parse(msg)
        const events = {
            auth: async () => {
                try {
                    const obj = await getJWTPayload(msgObj.message)
                    if (obj) {
                        ws.isAuth = true
                        ws._id = obj._id
                        ws.send(JSON.stringify({
                            event: 'message',
                            message: 'auth is ok'
                        }))
                    }
                } catch (error) {
                    ws.send(JSON.stringify({
                        event: 'noauth',
                        message: 'please auth again'
                    }))
                }
            },
            heartbeat: () => {
                if (msgObj.message === 'pong') {
                    ws.isAlive = true

                }
            },
            message: () => {
                // 鉴权拦截
                if (!ws.isAuth && this.isAuth) {
                    return
                }
                // 消息广播
                this.wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN && client._id === ws._id) {
                        this.send(msg)
                    }
                })
            }
        }
        events[msgObj.event]()

    }
    // 点对点的消息发送
    send(msg) {
    // send(uid, msg) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket) {
            // if (client.readyState === WebSocket.OPEN && client._id === uid) {
                this.send(msg)
            }
        })
    }

    // 广播消息 => 推送系统消息
    broadcast(msg) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                this.send(msg)
            }
        })
    }

    onClose(ws) {}

    // 心跳检测
    heartbeat() {
        clearInterval(this.interval)
        this.interval = setInterval(() => {
            this.wss.clients.forEach((ws) => {
                // 如果已经是不在线状态了，则直接终止当此连接，房间连接数-1
                if (!ws.isAlive && ws.roomid) {
                    delete ws['roomid']
                    return ws.terminate()
                }
                // 主动发送心跳检测请求
                // 当客户返回了消息之后，主要设置flag为在线
                ws.isAlive = false
                ws.send(JSON.stringify({
                    event: 'heartbeat',
                    message: 'ping',
                    num: group[ws.roomid]
                }))
            })
        }, this.timeInterval)
    }
}

export default WebSocketServer