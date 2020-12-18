import nodemailer from 'nodemailer'

async function send(sendInfo) {

  let transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 587,
    secure: false, 
    auth: {
      user: '893352008@qq.com', 
      pass: 'irjqqnwnsclcbccj', 
    },
  })

  let url = 'http://www.gz.gov.cn'


  let info = await transporter.sendMail({
    from: '"认证邮件" <893352008@qq.com>', // 邮箱号一定要和上面的配置的auth里的user一样
    to: sendInfo.email, // 发送到谁那里，如果是群发，这个地方可以放一个数组列表
    subject: sendInfo.user !== '' ?
      `你好，${sendInfo.user}！降温预警` : '降温预警', // 邮件主题
    text: `验证码是${sendInfo.code},过期时间: ${sendInfo.expire}`, // 当存在html的时候，text里的内容就不会显示了
    html: `
        <div style="border: 1px solid #dcdcdc;color: #676767;width: 600px; margin: 0 auto; padding-bottom: 50px;position: relative;">
        <div style="height: 60px; background: #393d49; line-height: 60px; color: #58a36f; font-size: 18px;padding-left: 10px;">此生无悔种花家</div>
        <div style="padding: 25px">
          <div>您好，${sendInfo.user}，冷空气将于明天抵达本市，请记得加衣，注意保温，谨防感冒。此提示过期时间: ${sendInfo.expire}</div>
          <a href="${url}" style="padding: 10px 20px; color: #fff; background: #009e94; display: inline-block;margin: 15px 0;">我已知晓</a>
          <div style="padding: 5px; background: #f2f2f2;">如果该邮件不是由你本人操作，请勿点击按钮！否则会有帐号风险。</div>
        </div>
        <div style="background: #fafafa; color: #b4b4b4;text-align: center; line-height: 45px; height: 45px; position: absolute; left: 0; bottom: 0;width: 100%;">系统邮件，请勿直接回复</div>
    </div>
    `, // html body
  })

  return 'Message sent: %s', info.messageId
}

// main().catch(console.error)

export default send