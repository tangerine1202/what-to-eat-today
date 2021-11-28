import model from '../model/index.js'
import client from '../config/lineClient.js'

export default async function (event) {
  const { userId } = event.source
  // catch get profile
  const { displayName, pictureUrl } = await client.getProfile(userId)
  const defaultCoordinates = [25.033860138538692, 121.5645717456342]
  const defaultAddress = '110台北市信義區信義路五段7號'
  const user = {
    user_id: userId,
    name: displayName,
    picture_url: pictureUrl,
    address: defaultAddress,
    location: {
      coordinates: defaultCoordinates
    }
  }
  // TODO: change to brief introduction
  const greeting = { type: 'text', text: `Good to see you ${displayName}` }

  try {
    const hasExist = await model.User.exists({ user_id: userId })
    if (!hasExist) {
      await model.User.create(user)
      console.log('Create user successfully')
    }
    return client.replyMessage(event.replyToken, greeting)
  } catch (err) {
    console.error(err)
    throw new Error('Failed to add user to db')
  }
}
