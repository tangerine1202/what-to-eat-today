import client from '../config/lineClient.js'
import model from '../model/index.js'
import { replyText, getQuickReply, updateLocationActionFactory } from '../lib/replyHelper.js'

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

  const greeting = (name, address) => ([
    `哈囉 ${name}，歡迎使用 What To Eat Today！`,
    '',
    '# 使用說明',
    '1. 請輸入「說明」或「help」查詢指令。',
    '2. 請點選左下角「＋」並選擇「位置資訊」，以更新你目前的所在地！',
    '',
    `目前位置：${address}`
  ].join('\n'))
  const quickReply = getQuickReply([updateLocationActionFactory('更新所在地')])

  try {
    const existUser = await model.User.findOne({ user_id: userId })
    if (!existUser) {
      await model.User.create(user)
      console.log('Create user successfully')
      return replyText(replyToken, greeting(user.name, user.address), quickReply)
    }

    return replyText(replyToken, greeting(existUser.name, existUser.address), quickReply)
  } catch (err) {
    console.error(err)
    throw new Error('Failed to add user to database')
  }
}
