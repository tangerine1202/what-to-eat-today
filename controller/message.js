import client from '../config/lineClient.js'

export default function (event) {
  const { message } = event
  const { type, text } = message

  if (type !== 'text') return Promise.resolve(null)

  return client.replyMessage(event.replyToken, { type: 'text', text })
}
