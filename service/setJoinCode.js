import model from '../model/index.js'
import { replyText } from '../lib/replyHelper.js'

export default async function setJoinCode (replyToken, { userId, joinCode }) {
  try {
    await model.User.updateOne({ user_id: userId }, { join_code: joinCode })
    return replyText(replyToken, `共享號碼更新成功！\n共享號碼：${joinCode}`)
  } catch (err) {
    if (err.name === 'MongoServerError' && err.code === 11000) {
      console.log('Join code collides with others')
      return replyText(replyToken, '共享號碼與他人衝突，請換一組共享號碼')
    }
    console.error(err)
    throw new Error('Failed to update join code to database')
  }
}
