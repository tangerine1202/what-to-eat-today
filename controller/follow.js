import service from '../service/index.js'
import ErrorRes from '../lib/errorRes.js'
import { replyText } from '../lib/replyHelper.js'

export default async function (event) {
  const { replyToken, source } = event
  const { userId } = source

  try {
    const res = await service.followBot(replyToken, { userId })
    return res
  } catch (err) {
    if (err instanceof ErrorRes) {
      return replyText(replyToken, err.message)
    } else {
      return replyText(replyToken, 'Server error')
    }
  }
}
