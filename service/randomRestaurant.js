import model from '../model/index.js'
import { replyText, replyCarousel, randomNextActionFactory, updateLocationActionFactory, getQuickReply } from '../lib/replyHelper.js'

export default async function randomRestaurant (replyToken, { userId, total = -1, distance, joinCodes }) {
  const users = await model.User.find({ $or: [{ user_id: userId }, { join_code: joinCodes }] }).lean().exec()
  const user = users.find((e) => (e.user_id === userId))
  const placeIdOfUsersRestaurants = users.flatMap((e) => e.restaurants.map((r) => r.place_id))
  const distanceInMiles = (distance * 0.0006213712) / 3963.2
  let count = total

  try {
    if (count < 0) {
      count = await model.Restaurant.countDocuments({
        place_id: placeIdOfUsersRestaurants,
        location: {
          $geoWithin: {
            $centerSphere: [user.location.coordinates, distanceInMiles]
          }
        }
      }).exec()
    }

    const offset = Math.floor(Math.random() * count)
    const restaurants = await model.Restaurant.find({
      place_id: placeIdOfUsersRestaurants,
      location: {
        $geoWithin: {
          $centerSphere: [user.location.coordinates, distanceInMiles]
        }
      }
    }).skip(offset).limit(1).lean().exec()

    if (!restaurants || restaurants.length === 0) {
      const quickReply = getQuickReply([updateLocationActionFactory('距離遙遠？更新所在地')])
      return replyText(replyToken, 'Oops，附近找不到喜愛的餐廳，可以嘗試看看增大搜索範圍或「探索餐廳」！', quickReply)
    }

    return replyCarousel(replyToken, restaurants, [randomNextActionFactory({ total: count, distance, joinCodes })])
  } catch (err) {
    console.error(err)
    throw new Error('Failed to get restaurants from database')
  }
}
