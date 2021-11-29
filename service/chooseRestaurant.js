import model from '../model/index.js'
import ErrorRes from '../lib/errorRes.js'
import client from '../config/lineClient.js'
import { replyCarousel } from '../lib/replyHelper.js'

export default async function chooseRestaurant (replyToken, { userId, limit, offset, distance }) {
  try {
    const user = await model.User.findOne({ user_id: userId }, ['location', 'restaurants']).lean()
    const placeIdOfUserRestaurants = user.restaurants.map((e) => e.place_id)
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
    }).lean()
    const res = restaurants
      .filter((restaurant) => (placeIdOfUserRestaurants.includes(restaurant.place_id)))
      .slice(offset, offset + limit)
    if (!res || res.length === 0) {
      return client.replyMessage(replyToken, { type: 'text', text: 'Oops，附近找不到喜愛的餐廳，可以嘗試看看增大搜索範圍或「探索餐廳」！' })
    }
    return replyCarousel(replyToken, res)
  } catch (err) {
    console.log(err)
    throw new ErrorRes('Failed to get restaurants from database')
  }
}
