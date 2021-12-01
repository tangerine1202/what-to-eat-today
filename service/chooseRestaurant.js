import model from '../model/index.js'
import ErrorRes from '../lib/errorRes.js'
import { replyText, replyCarousel, viewActionFactory, updateLocationActionFactory, getMoreColumn, getQuickReply } from '../lib/replyHelper.js'
import { calculateLatLngDistance } from '../lib/utils.js'

export default async function chooseRestaurant (replyToken, { userId, limit, offset, distance, joinCodes }) {
  try {
    const users = await model.User.find({ $or: [{ user_id: userId }, { join_code: joinCodes }] }).lean().exec()
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
      if (offset === 0) {
        const quickReply = getQuickReply([updateLocationActionFactory()])
        return replyText(replyToken, 'Oops，附近找不到喜愛的餐廳，可以嘗試看看增大搜索範圍或「探索餐廳」！', quickReply)
      } else {
        return replyText(replyToken, '已列出附近所有喜愛的餐廳，如果還是選不定可以嘗試看看增大搜索範圍或「探索餐廳」喔！')
      }
    }

    let quickReply = null
    if (offset === 0 && calculateLatLngDistance(
      user.location.coordinates[1],
      user.location.coordinates[0],
      restaurants[0].location.coordinates[1],
      restaurants[0].location.coordinates[0]
    ) > 5000) {
      quickReply = getQuickReply([updateLocationActionFactory()])
    }

    return replyCarousel(replyToken, restaurants, [viewActionFactory()], getMoreColumn('choose', limit, offset, distance, joinCodes), quickReply)
  } catch (err) {
    console.error(err)
    throw new ErrorRes('Failed to get restaurants from database')
  }
}
