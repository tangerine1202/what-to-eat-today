import { replyText } from '../lib/replyHelper.js'

export default function (replyToken, { text }) {
  return replyText(replyToken, text)
}
