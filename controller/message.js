import client from '../config/lineClient.js'
import service from '../service/index.js'
import ErrorRes from '../lib/errorRes.js'
import keywords from '../lib/keywords.js'

export default function (event) {
  const { message, source, replyToken } = event
  const { userId } = source
  const { type } = message

  try {
    if (type === 'text') {
      const { text } = message
      const terms = text.trim().split(' ')
      const prefix = terms[0]

      if (keywords.addRestaurant.includes(prefix)) {
        const customNames = terms.slice(1)
        if (customNames.length === 0) {
          console.error('Add Restaurant without names')
          throw new ErrorRes('請加上餐廳名稱。\n格式：新增餐廳 <餐廳名稱>')
        } else if (customNames.length > 5) {
          console.error('Add too many Restaurant in one message')
          throw new ErrorRes('一次最多新增 5 間餐廳，有需要請分成多則訊息傳送。')
        }
        return service.addRestaurant(replyToken, { userId, customNames })
      } else if (keywords.removeRestaurant.includes(prefix)) {
        return service.removeRestaurant(replyToken, { userId, text })
      } else if (keywords.chooseRestaurant.includes(prefix)) {
        const limit = 5
        const offset = 0
        // Note: distance in meters
        let distance = 3000

        // parse searching range (e.g.: "in 3000 m")
        const maxDistance = 10000
        const distKeywordIdx = terms.indexOf('in')
        if (distKeywordIdx !== -1) {
          const distIdx = distKeywordIdx + 1
          const distUnitIdx = distKeywordIdx + 2

          if (distIdx >= terms.length) throw new ErrorRes('缺少距離數字')
          if (Number.isNaN(Number.parseFloat(terms[distIdx]))) throw new ErrorRes('距離數字無法解析')
          if (distUnitIdx >= terms.length) throw new ErrorRes('缺少距離單位')
          if (!['km', 'm'].includes(terms[distUnitIdx])) throw new ErrorRes('距離單位請使用 "km" 或 "m"')
          distance = Number.parseFloat(terms[distIdx]) * ((terms[distUnitIdx] === 'km') ? 1000 : 1)
          distance = Math.min(distance, maxDistance)
        }

        return service.chooseRestaurant(replyToken, { userId, limit, offset, distance })
      } else if (keywords.exploreRestaurant.includes(prefix)) {
        return service.exploreRestaurant(replyToken, { userId, text })
      } else if (keywords.coChooseRestaurant.includes(prefix)) {
        return service.coChooseRestaurant(replyToken, { userId, text })
      } else if (keywords.setJoinCode.includes(prefix)) {
        return service.setJoinCode(replyToken, { userId, text })
      } else {
        return service.echo(replyToken, { text })
      }
    } else if (type === 'location') {
      const { latitude, longitude } = message
      const { address = `(${latitude}, ${longitude})` } = message

      if (latitude > 90.0 || latitude < -90.0 || longitude > 180.0 || longitude < -180.0) {
        console.error(`latitude or longitude out of range. Expect lat in [-90, 90] and lng in [-180, 180], but get (${latitude}, ${longitude})`)
        throw new ErrorRes('latitude or longitude out of range.')
      }

      const res = service.updateUserLocation(replyToken, { userId, address, latitude, longitude })
      return res
    } else {
      return Promise.resolve(null)
    }
  } catch (err) {
    if (err instanceof ErrorRes) {
      return client.replyMessage(replyToken, { type: 'text', text: err.message })
    } else {
      console.error(err)
      return client.replyMessage(replyToken, { type: 'text', text: 'Server error' })
    }
  }
}
