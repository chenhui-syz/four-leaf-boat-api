import nodemailer from 'nodemailer'
import config from '@/config'
import qs from 'qs'

async function send(sendInfo) {
  let transporter = nodemailer.createTransport({
    host: 'smtp.qq.com', // 这个是qq邮箱的主机地址，只要是用的qq邮箱，这个地方就是固定的，不能随意修改
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: '893352008@qq.com', // generated ethereal user
      pass: 'obbzxuzvnnnjbdjh', // generated ethereal password
    },
  })

  // 用户跳转链接
  const baseUrl = config.baseUrl
  const route = sendInfo.type === 'email' ? '/confirm' : '/reset'
  let url = `${baseUrl}/#${route}?` + qs.stringify(sendInfo.data)
  console.log('hhhjjjjjjj')
  console.log(url)
  // send mail with defined transport object 
  let info = await transporter.sendMail({
    from: '"认证邮件" <893352008@qq.com>', // sender address
    to: sendInfo.email, // list of receivers
    subject: '这里填写的邮件主题',
    text: '当html有内容的时候，text的内容不会显示',
    html: `
        <div style="border: 1px solid #dcdcdc;color: #676767;width: 600px; margin: 0 auto; padding-bottom: 50px;position: relative;">
        <div style="height: 60px; background: #393d49; line-height: 60px; color: #58a36f; font-size: 18px;padding-left: 10px;">Imooc社区——欢迎来到官方社区</div>
        <div style="padding: 25px">
          <div>您好，${sendInfo.user}童鞋，链接有效时间30分钟，请在${
      sendInfo.expire
    }之前重置您的密码：</div>
          <a href="${url}" style="padding: 10px 20px; color: #fff; background: #009e94; display: inline-block;margin: 15px 0;">立即重置密码</a>
          <div style="padding: 5px; background: #f2f2f2;">如果该邮件不是由你本人操作，请勿进行激活！否则你的邮箱将会被他人绑定。</div>
        </div>
        <div style="background: #fafafa; color: #b4b4b4;text-align: center; line-height: 45px; height: 45px; position: absolute; left: 0; bottom: 0;width: 100%;">系统邮件，请勿直接回复</div>
    </div>
    `, // html body
  })

  return 'Message sent: %s', info.messageId
}

export default send