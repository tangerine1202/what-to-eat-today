import client from '../config/lineClient.js'
import service from '../service/index.js'

export default async function (event) {
  const { replyToken, source } = event
  const { userId } = source

  try {
    const res = await service.followBot(replyToken, { userId })
    return res
  } catch (err) {
    return client.replyMessage(replyToken, { type: 'text', text: err.message })
  }
}
