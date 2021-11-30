import model from '../model/index.js'
import ErrorRes from '../lib/errorRes.js'
import client from '../config/lineClient.js'
import { replyCarousel } from '../lib/replyHelper.js'

export default async function chooseRestaurant (replyToken, { userId, joinCodes, limit, offset, distance }) {
  try {
    const users = await model.User.find({ $or: [{ user_id: userId }, { join_code: joinCodes }] }, ['user_id', 'location', 'restaurants']).lean().exec()
    const user = users.find((e) => (e.user_id === userId))
    const placeIdOfUsersRestaurants = users.flatMap((e) => e.restaurants.map((r) => r.place_id))
    const restaurants = await model.Restaurant.find({
      place_id: placeIdOfUsersRestaurants,
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: user.location.coordinates
          },
          $maxDistance: distance
        }
      }
    }).skip(offset).limit(limit).lean().exec()
    if (!restaurants || restaurants.length === 0) {
      return client.replyMessage(replyToken, { type: 'text', text: 'Oops，附近找不到喜愛的餐廳，可以嘗試看看增大搜索範圍或「探索餐廳」！' })
    }
    return replyCarousel(replyToken, restaurants)
  } catch (err) {
    console.error(err)
    throw new ErrorRes('Failed to get restaurants from database')
  }
}
