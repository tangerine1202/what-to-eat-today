import client from '../config/lineClient.js'
import service from '../service/index.js'
import ErrorRes from '../lib/errorRes.js'
import { keywords, getAllOperatorPrefixes } from '../lib/keywords.js'

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
        const customNames = parseRestaurant(terms)
        return service.addRestaurant(replyToken, { userId, customNames })
      } else if (keywords.removeRestaurant.includes(prefix)) {
        return service.removeRestaurant(replyToken, { userId, text })
      } else if (keywords.chooseRestaurant.includes(prefix)) {
        const limit = 5
        const offset = 0
        const distance = parseDistance(terms)
        const joinCodes = parseJoinCodes(terms)
        return service.chooseRestaurant(replyToken, { userId, limit, offset, distance, joinCodes })
      } else if (keywords.exploreRestaurant.includes(prefix)) {
        const limit = 5
        const offset = 0
        const distance = parseDistance(terms)
        return service.exploreRestaurant(replyToken, { userId, limit, offset, distance })
      } else if (keywords.setJoinCode.includes(prefix)) {
        const joinCode = terms[1]
        if (!/^\w{4,24}$/.test(joinCode)) {
          console.error(`Invalid join code, ${joinCode}`)
          throw new ErrorRes('不合法的共享號碼。僅能使用英文字母（a-zA-Z）、數字（0-9）、底線（_），長度介於 4 到 24 位之間')
        }
        if (getAllOperatorPrefixes().includes(joinCode)) {
          console.error('Join code collide with command keywords')
          throw new ErrorRes('共享號碼與指令關鍵字衝突，請設定其他共享號碼')
        }
        return service.setJoinCode(replyToken, { userId, joinCode })
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

function parseRestaurant (terms) {
  const allOperatorPrefixes = getAllOperatorPrefixes()
  const customNames = []

  // exclude command name
  for (let i = 1; i < terms.length; i++) {
    if (allOperatorPrefixes.includes(terms[i])) break
    customNames.push(terms[i])
  }

  if (customNames.length === 0) {
    console.error('Add Restaurant without names')
    throw new ErrorRes('請加上餐廳名稱。\n格式：新增餐廳 <餐廳名稱>')
  } else if (customNames.length > 5) {
    console.error('Add too many Restaurant in one message')
    throw new ErrorRes('一次最多新增 5 間餐廳，有需要請分成多則訊息傳送。')
  }

  return customNames
}

function parseDistance (terms) {
  // parsing format: "in <positive float> <m/km>"
  // distance in meters unit
  const operator = keywords.operators.distance
  let distance = 3000
  const maxDistance = 10000
  let prefixIdx = -1

  for (const i in terms) {
    if (operator.prefix.includes(terms[i])) {
      prefixIdx = Number(i)
      break
    }
  }
  if (prefixIdx !== -1) {
    const distIdx = prefixIdx + 1
    const distUnitIdx = prefixIdx + 2

    if (distIdx >= terms.length) throw new ErrorRes('缺少距離數字')
    if (/^\d+\.?\d*$/.test(terms[distIdx]) && Number.isNaN(Number.parseFloat(terms[distIdx]))) throw new ErrorRes('距離數字無法解析')
    if (distUnitIdx >= terms.length) throw new ErrorRes('缺少距離單位')
    if (!operator.suffix.includes(terms[distUnitIdx])) throw new ErrorRes('距離單位請使用 "km" 或 "m"')

    distance = Number.parseFloat(terms[distIdx]) * ((terms[distUnitIdx] === 'km') ? 1000 : 1)
    distance = Math.min(distance, maxDistance)
  }

  return distance
}

function parseJoinCodes (terms) {
  // parsing format: "with <join_code1> [join_codes...]"
  const operator = keywords.operators.joinCodes
  const allOperatorPrefixes = getAllOperatorPrefixes()
  const joinCodes = []
  let prefixIdx = -1

  for (const i in terms) {
    if (operator.prefix.includes(terms[i])) {
      prefixIdx = Number(i)
      break
    }
  }
  if (prefixIdx !== -1) {
    for (let i = prefixIdx + 1; i < terms.length; i++) {
      if (allOperatorPrefixes.includes(terms[i])) break
      joinCodes.push(terms[i])
    }
  }

  if (prefixIdx !== -1 && joinCodes.length === 0) {
    console.error('Choose with others does not provide join codes')
    throw new ErrorRes('請加上共享號碼。\n格式：共同選擇餐廳 <共享號碼1> [共享號碼...]')
  }

  return joinCodes
}
