import model from '../model/index.js'
import client from '../config/lineClient.js'

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
  const greeting = { type: 'text', text: `哈囉 ${displayName}，歡迎使用 What To Eat Today！\n請於左下角傳送「位置資訊」以便提供更好的搜尋結果喔！` }

  try {
    const hasExist = await model.User.exists({ user_id: userId })
    if (!hasExist) {
      await model.User.create(user)
      console.log('Create user successfully')
    }
    return client.replyMessage(replyToken, greeting)
  } catch (err) {
    console.error(err)
    throw new Error('Failed to add user to database')
  }
}
