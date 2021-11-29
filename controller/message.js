import client from '../config/lineClient.js'
import service from '../service/index.js'

export default function (event) {
  const { message, source, replyToken } = event
  const { userId } = source
  const { type } = message

  try {
    if (type === 'text') {
      const { text } = message
      const res = service.echo(replyToken, { text })
      return res
    } else {
      return Promise.resolve(null)
    }
  } catch (err) {
    return client.replyMessage(replyToken, { type: 'text', text: err.message })
  }
}
