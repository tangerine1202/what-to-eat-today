import client from '../config/lineClient.js'
import service from '../service/index.js'
import ErrorRes from '../lib/errorRes.js'

export default function (event) {
  const { message, source, replyToken } = event
  const { userId } = source
  const { type } = message

  try {
    if (type === 'text') {
      const { text } = message
      const res = service.echo(replyToken, { text })
      return res
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
