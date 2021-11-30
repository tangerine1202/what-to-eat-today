import model from '../model/index.js'
import ErrorRes from '../lib/errorRes.js'
import { replyText, replyCarousel } from '../lib/replyHelper.js'

export default async function exploreRestaurant (replyToken, { userId, limit, offset, distance }) {
  try {
    const user = await model.User.findOne({ user_id: userId }).lean()
    const restaurants = await model.Restaurant.find({
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
      return replyText(replyToken, 'Uh oh，附近找不到推薦的餐廳，相信你不會踩到雷的！')
    }
    return replyCarousel(replyToken, restaurants)
  } catch (err) {
    console.error(err)
    throw new ErrorRes('Failed to get restaurants from database')
  }
}
