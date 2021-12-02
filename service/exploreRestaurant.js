import model from '../model/index.js'
import { replyText, replyCarousel, viewActionFactory, updateLocationActionFactory, getMoreColumn, getQuickReply } from '../lib/replyHelper.js'
import { calculateLatLngDistance } from '../lib/utils.js'

export default async function exploreRestaurant (replyToken, { userId, limit, offset, distance }) {
  try {
    const user = await model.User.findOne({ user_id: userId }).lean().exec()
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
        const quickReply = getQuickReply([updateLocationActionFactory('距離遙遠？更新所在地')])
        return replyText(replyToken, 'Oh no，附近找不到推薦的餐廳，趕快使用「新增餐廳」來新增第一間吧！', quickReply)
      } else {
        return replyText(replyToken, 'Uh oh，已列出附近所有推薦的餐廳，相信你不會踩到雷的！')
      }
    }

    let quickReply = null
    if (offset === 0 && calculateLatLngDistance(
      user.location.coordinates[1],
      user.location.coordinates[0],
      restaurants[0].location.coordinates[1],
      restaurants[0].location.coordinates[0]
    ) > 5000) {
      quickReply = getQuickReply([updateLocationActionFactory('距離遙遠？更新所在地')])
    }

    return replyCarousel(replyToken, restaurants, [viewActionFactory()], getMoreColumn('explore', limit, offset, distance), quickReply)
  } catch (err) {
    console.error(err)
    throw new Error('Failed to get restaurants from database')
  }
}
