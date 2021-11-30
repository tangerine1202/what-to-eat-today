import model from '../model/index.js'
import ErrorRes from '../lib/errorRes.js'
import { replyText, replyCarousel, getViewAction, getMoreColumn } from '../lib/replyHelper.js'

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
        return replyText(replyToken, 'Oops，附近找不到喜愛的餐廳，可以嘗試看看增大搜索範圍或「探索餐廳」！')
      } else {
        return replyText(replyToken, '已列出附近所有喜愛的餐廳，如果還是選不定可以嘗試看看增大搜索範圍或「探索餐廳」喔！')
      }
    }
    return replyCarousel(replyToken, restaurants, [getViewAction], getMoreColumn('choose', limit, offset, distance, joinCodes))
  } catch (err) {
    console.error(err)
    throw new ErrorRes('Failed to get restaurants from database')
  }
}
