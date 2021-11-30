import model from '../model/index.js'
import ErrorRes from '../lib/errorRes.js'
import client from '../config/lineClient.js'
import { findPlace } from '../lib/googleApi.js'

export default async function removeRestaurant (replyToken, { userId, customNames }) {
  const user = await model.User.findOne({ user_id: userId }, ['restaurants', 'location']).lean()
  const newUserRestaurants = [...user.restaurants]
  const removedNames = []
  const unRemovedNames = [...customNames]
  const unSeenNames = []
  const placeProcesses = []

  for (const name of customNames) {
    const removedIdx = newUserRestaurants.findIndex((e) => (e.custom_name === name))
    if (removedIdx !== -1) {
      newUserRestaurants.splice(removedIdx, 1)
      removedNames.push(name)
      unRemovedNames.splice(unRemovedNames.indexOf(name), 1)
    } else {
      placeProcesses.push(findPlace(name, user.location.coordinates[1], user.location.coordinates[0]))
      unSeenNames.push(name)
    }
  }

  const responses = (await Promise.all(placeProcesses)).filter((e) => e)
  for (const [idx, place] of Object.entries(responses)) {
    const removedIdx = newUserRestaurants.findIndex((e) => (e.place_id === place.place_id))
    if (removedIdx !== -1) {
      const removedName = unSeenNames[idx]
      newUserRestaurants.splice(removedIdx, 1)
      removedNames.push(removedName)
      unRemovedNames.splice(unRemovedNames.indexOf(removedName), 1)
    }
  }

  try {
    const removedListMsg = `以下餐廳已移除成功\n- ${removedNames.join('\n- ')}`
    const unRemovedListMsg = `查無與以下名稱相符的餐廳\n- ${unRemovedNames.join('\n- ')}`
    if (newUserRestaurants.length === user.restaurants.length) {
      return client.replyMessage(replyToken, { type: 'text', text: unRemovedListMsg })
    }
    await model.User.updateOne({ user_id: userId }, { restaurants: newUserRestaurants })
    let text = removedListMsg
    if (unRemovedNames.length !== 0) {
      text = `${text}\n\n${unRemovedListMsg}`
    }
    return client.replyMessage(replyToken, { type: 'text', text })
  } catch (err) {
    console.error(err)
    throw new ErrorRes('Failed to add restaurant to database')
  }
}
