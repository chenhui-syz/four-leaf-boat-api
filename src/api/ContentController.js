// import Post from '../model/Post'
// import Links from '../model/Links'
import fs from 'fs'
import uuid from 'uuid/dist/v4'
import mement from 'dayjs'
import config from '@/config'
import {
    dirExists
} from '@/common/Utils'

class ContentController {
    // 获取文章列表
    async getPostList(ctx) {
        const body = ctx.query
        const sort = body.sort ? body.sort : 'created'
        const page = body.page ? parseInt(body.page) : 0
        const limit = body.limit ? parseInt(body.limit) : 20
        const options = {}

        if (typeof body.catalog !== 'undefined' && body.catalog !== '') {
            options.catalog = body.catalog
        }
        if (typeof body.isTop !== 'undefined') {
            options.isTop = body.isTop
        }
        if (typeof body.status !== 'undefined' && body.status !== '') {
            options.isEnd = body.status
        }
        if (typeof body.tag !== 'undefined' && body.tag !== '') {
            options.tags = {
                $elemMatch: {
                    name: body.tag
                }
            }
        }

        const result = await Post.getList(options, sort, page, limit)

        ctx.body = {
            code: 200,
            data: result,
            msg: '获取文章列表成功'
        }
    }

    // 查询友情链接
    async getLinks(ctx) {
        const result = await Links.find({
            type: 'links'
        })
        ctx.body = {
            code: 200,
            data: result
        }
    }

    // 查询温馨提醒
    async getTips(ctx) {
        const result = await Links.find({
            type: 'tips'
        })
        ctx.body = {
            code: 200,
            data: result
        }
    }

    // 本周热议
    async getTopWeek(ctx) {
        const result = await Post.getTopWeek()
        ctx.body = {
            code: 200,
            data: result
        }
    }

    // 上传图片
    async uploadImg(ctx) {
        const file = ctx.request.files.file
        console.log('config.uploadPath', config.uploadPath)
        // 图片的名称，图片的格式，存储的位置，最终返回前台可以读取的路径
        const ext = file.name.split(',').pop()
        const dir = `${config.uploadPath}/avatar/${mement().format('YYYYMMDD')}`
        console.log('完整的路径', dir)
        console.log('文件名称', ext)
        // 判断路径是否存在，不存在则创建
        await dirExists(dir)
        // 存储文件到指定的路径
        // 给文件一个唯一的名称
        const picname = uuid()
        const destPath = `${dir}/${picname}.${ext}`
        // 读取文件流
        // highWaterMark: 1 * 1024:将每次的上传进度改为1kb
        const reader = fs.createReadStream(file.path, {
            highWaterMark: 1 * 1024
        })
        // 导入文件流
        const upStream = fs.createWriteStream(destPath)
        // 因为public目录里面的文件都直接做了静态资源分享
        // 所以把文件的public后的路径+文件名返给前台
        const filePath = `/${mement().format('YYYYMMDD')}/${picname}.${ext}`
        // 写入文件===>方法1,简单易用
        // reader.pipe(upStream)
        // 写入文件===>方法2,应用于大文件，可以监听异常以及文件的上传进度
        // 默认每次读取64kb
        // 当前文件已读取的长度
        let totalLength = 0
        // 文件总长度
        const stat = fs.statSync(file.path)
        console.log('文件总长度', stat.size)
        reader.on('data', (chunk) => {
            totalLength += chunk.length
            console.log('读取的长度', totalLength)
            if (upStream.write(chunk) === false) {
                reader.pause()
            }
        })
        reader.on('drain', () => {
            reader.resume()
        })
        reader.on('end', () => {
            upStream.end()
        })

        ctx.body = {
            code: 200,
            msg: '图片上传成功',
            data: filePath
        }

    }
}

export default new ContentController()