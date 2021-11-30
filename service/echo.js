import { replyText } from '../lib/replyHelper.js'

export default function (replyToken, { text }) {
  const echo = { type: 'text', text }
  return replyText(replyToken, echo)
}
