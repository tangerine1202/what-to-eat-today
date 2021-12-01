import service from '../service/index.js'
import ErrorRes from '../lib/errorRes.js'
import { replyText } from '../lib/replyHelper.js'

export default async function (event) {
  const { replyToken, source } = event
  const { userId } = source

  try {
    return service.followBot(replyToken, { userId })
  } catch (err) {
    if (err instanceof ErrorRes) {
      return replyText(replyToken, err.message)
    } else {
      return replyText(replyToken, 'Server error')
    }
  }
}
