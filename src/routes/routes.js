import combineRoutes from 'koa-combine-routers'

// import publicRouter from './publicRouter'
// import loginRouter from './loginRouter'
// import userRouter from './userRouter'
// ...
// 当路由变多的时候，上面的import会非常的多，会变得难以阅读
// 利用webpack提供的打包优化功能：
// 使用require.context把一个目录下的文件全部给import进来
// 加载目录中的Router的中间件
const moduleFiles = require.context('./modules', true, /\.js$/)
// reduce方法去拼接koa-combine-routers所需的数据结构Object[]
const modules = moduleFiles.keys().reduce((items, path) => {
    const value = moduleFiles(path)
    items.push(value.default)
    return items
}, [])

export default combineRoutes(
    // publicRouter, loginRouter, userRouter
    modules
)

// 经过上面的处理之后，下面再添加路由，直接就在modules中添加，这里就自动引入了
// modules文件夹甚至也可以再新建文件夹，这里也都可以自动引入