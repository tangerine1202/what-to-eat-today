import model from '../model/index.js'
import client from '../config/lineClient.js'
import ErrorRes from '../lib/errorRes.js'

export default async function (replyToken, { userId, address, latitude, longitude }) {
  const filter = { user_id: userId }
  const params = {
    address,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude]
    }
  }
  const replyMsg = {
    type: 'location',
    title: '所在地更新成功！',
    address,
    latitude,
    longitude
  }

  try {
    await model.User.updateOne(filter, params)
    console.log('Update user location successfully')
    return client.replyMessage(replyToken, replyMsg)
  } catch (err) {
    console.error(err)
    throw new ErrorRes('Failed to update user location')
  }
}
