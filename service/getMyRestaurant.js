import model from '../model/index.js'
import ErrorRes from '../lib/errorRes.js'
import { replyText, replyCarousel } from '../lib/replyHelper.js'

export default async function getMyRestaurant (replyToken, { userId, limit, offset }) {
  try {
    const user = await model.User.findOne({ user_id: userId }).lean()
    const placeIdOfUsersRestaurants = user.restaurants.map((e) => e.place_id)
    const restaurants = await model.Restaurant.find({
      place_id: placeIdOfUsersRestaurants,
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: user.location.coordinates
          }
        }
      }
    }).skip(offset).limit(limit).lean().exec()
    if (!restaurants || restaurants.length === 0) {
      return replyText(replyToken, '你尚未新增過餐廳，使用「新增餐廳」來新增第一間吧！')
    }
    return replyCarousel(replyToken, restaurants)
  } catch (err) {
    console.error(err)
    throw new ErrorRes('Failed to get restaurants from database')
  }
}