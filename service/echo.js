import client from '../config/lineClient.js'

export default function (replyToken, { text }) {
  const echo = { type: 'text', text }
  return client.replyMessage(replyToken, echo)
}
