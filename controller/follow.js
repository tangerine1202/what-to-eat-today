import client from '../config/lineClient.js'
import service from '../service/index.js'
import ErrorRes from '../lib/errorRes.js'

export default async function (event) {
  const { replyToken, source } = event
  const { userId } = source

  try {
    const res = await service.followBot(replyToken, { userId })
    return res
  } catch (err) {
    if (err instanceof ErrorRes) {
      return client.replyMessage(replyToken, { type: 'text', text: err.message })
    } else {
      return client.replyMessage(replyToken, { type: 'text', text: 'Server error' })
    }
  }
}
