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

    onMessage(ws,msg){
        // 用户鉴权
    }

    onClose(ws){}
}