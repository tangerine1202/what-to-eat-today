import model from '../model/index.js'
import ErrorRes from '../lib/errorRes.js'
import { replyLocation } from '../lib/replyHelper.js'

export default async function (replyToken, { userId, address, latitude, longitude }) {
  const filter = { user_id: userId }
  const params = {
    address,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude]
    }
  }

  try {
    await model.User.updateOne(filter, params)
    console.log('Update user location successfully')
    return replyLocation(replyToken, '所在地更新成功！', address, latitude, longitude)
  } catch (err) {
    console.error(err)
    throw new ErrorRes('Failed to update user location')
  }
}
