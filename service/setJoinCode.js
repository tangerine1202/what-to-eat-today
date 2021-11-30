import model from '../model/index.js'
import ErrorRes from '../lib/errorRes.js'
import client from '../config/lineClient.js'

export default async function setJoinCode (replyToken, { userId, joinCode }) {
  try {
    await model.User.updateOne({ user_id: userId }, { join_code: joinCode })
    return client.replyMessage(replyToken, { type: 'text', text: `共享號碼更新成功！\n共享號碼：${joinCode}` })
  } catch (err) {
    if (err.name === 'MongoServerError' && err.code === 11000) {
      return client.replyMessage(replyToken, { type: 'text', text: '共享號碼與他人衝突，請換一組共享號碼' })
    }
    console.error(err)
    throw new ErrorRes('Failed to set join code to database')
  }
}
