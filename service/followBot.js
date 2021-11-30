import client from '../config/lineClient.js'
import model from '../model/index.js'
import ErrorRes from '../lib/errorRes.js'
import { replyText } from '../lib/replyHelper.js'

export default async function (replyToken, { userId }) {
  // Note: coordinates format: [lng, lat]
  const defaultCoordinates = [121.5645717456342, 25.033860138538692]
  const defaultAddress = '110台北市信義區信義路五段7號'
  // catch get profile
  const { displayName, pictureUrl } = await client.getProfile(userId)
  const user = {
    user_id: userId,
    name: displayName,
    picture_url: pictureUrl,
    address: defaultAddress,
    location: {
      type: 'Point',
      coordinates: defaultCoordinates
    }
  }
  // TODO: change to brief introduction
  const greeting = (name, address) => {
    return { type: 'text', text: `哈囉 ${name}，歡迎使用 What To Eat Today！\n請於左下角傳送「位置資訊」以更新你的地理位置！\n\n目前位置：${address}` }
  }

  try {
    const existUser = await model.User.findOne({ user_id: userId })
    if (!existUser) {
      await model.User.create(user)
      console.log('Create user successfully')
      return replyText(replyToken, greeting(user.name, user.address))
    }

    return replyText(replyToken, greeting(existUser.name, existUser.address))
  } catch (err) {
    console.error(err)
    throw new ErrorRes('Failed to add user to database')
  }
}
