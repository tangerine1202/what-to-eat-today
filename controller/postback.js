import service from '../service/index.js'
import ErrorRes from '../lib/errorRes.js'
import { replyText } from '../lib/replyHelper.js'
import { keywords } from '../lib/keywords.js'

export default function (event) {
  const { postback, source, replyToken } = event
  const { userId } = source
  const data = JSON.parse(postback.data)
  const { command } = data

  try {
    if (keywords.getMyRestaurant.includes(command)) {
      const { limit = 5, offset = 0 } = data
      return service.getMyRestaurant(replyToken, { userId, limit, offset })
    } else if (keywords.chooseRestaurant.includes(command)) {
      const { limit = 5, offset = 0, distance = 3000, joinCodes = [] } = data
      return service.chooseRestaurant(replyToken, { userId, limit, offset, distance, joinCodes })
    } else if (keywords.exploreRestaurant.includes(command)) {
      const { limit = 5, offset = 0, distance = 3000 } = data
      return service.exploreRestaurant(replyToken, { userId, limit, offset, distance })
    } else {
      return Promise.resolve(null)
    }
  } catch (err) {
    if (err instanceof ErrorRes) {
      return replyText(replyToken, err.message)
    } else {
      console.error(err)
      return replyText(replyToken, 'Server error')
    }
  }
}
