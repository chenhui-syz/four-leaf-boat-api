import {
    getJWTPayload
} from '@/common/Utils'
import WebSocket from 'ws'
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
                const obj = await getJWTPayload(msgObj.message)
                if (obj) {
                    ws.isAuth = true
                    ws._id = obj._id
                } else {
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

    onClose(ws) {}
}