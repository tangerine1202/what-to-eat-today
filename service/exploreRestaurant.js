import model from '../model/index.js'
import ErrorRes from '../lib/errorRes.js'
import { replyText, replyCarousel, getViewActionGetter, getMoreColumn } from '../lib/replyHelper.js'

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
      if (offset === 0) {
        return replyText(replyToken, 'Oh no，附近找不到推薦的餐廳，趕快使用「新增餐廳」來新增第一間吧！')
      } else {
        return replyText(replyToken, 'Uh oh，已列出附近所有推薦的餐廳，相信你不會踩到雷的！')
      }
    }
    return replyCarousel(replyToken, restaurants, [getViewActionGetter()], getMoreColumn('explore', limit, offset, distance))
  } catch (err) {
    console.error(err)
    throw new ErrorRes('Failed to get restaurants from database')
  }
}
