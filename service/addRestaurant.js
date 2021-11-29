import model from '../model/index.js'
import ErrorRes from '../lib/errorRes.js'
import client from '../config/lineClient.js'
import { findPlace, getPhotoUrl } from '../lib/googleApi.js'
import { replyCarousel } from '../lib/replyHelper.js'

export default async function addRestaurant (replyToken, { userId, customNames }) {
  const user = await model.User.findOne({ user_id: userId }).lean()
  const nameOfUserRestaurants = user.restaurants.map((e) => e.custom_name)
  const placeIdOfUserRestaurants = user.restaurants.map((e) => e.place_id)
  const placeProcesses = []
  const namePlaceObj = {}

  for (const name of customNames) {
    // 1. remove duplicated user restaurants with custom name
    if (nameOfUserRestaurants.includes(name)) continue
    // 2. fetch place information from Find Place Api
    placeProcesses.push(findPlace(name))
  }

  // 3. remove duplicated user restaurants with place_id
  const responses = await Promise.all(placeProcesses)
  for (const [idx, place] of Object.entries(responses)) {
    if (!place || placeIdOfUserRestaurants.includes(place.place_id)) continue
    namePlaceObj[customNames[idx]] = responses[idx]
  }

  try {
    if (Object.keys(namePlaceObj).length === 0) {
      // All added restaurants are duplicated
      return client.replyMessage(replyToken, { type: 'text', text: '所有餐廳都已經新增過囉！' })
    }
    // 4. update Restaurant
    const restaurants = await Promise.all(Object.values(namePlaceObj).map(addPlaceToRestaurant))
    // 5. update User.restaurants
    const newUserRestaurants = [...user.restaurants]
    Object.entries(namePlaceObj).map(([name, place]) => newUserRestaurants.push({ custom_name: name, place_id: place.place_id }))
    await model.User.updateOne({ user_id: userId }, { restaurants: newUserRestaurants })
    return replyCarousel(replyToken, restaurants)
  } catch (err) {
    console.log(err)
    throw new ErrorRes('Failed to add restaurant to database')
  }
}

async function addPlaceToRestaurant (place) {
  let photoUrl, photoAttribution
  if (!place.photos || place.photos.length === 0) {
    photoAttribution = 'Unsplash'
    photoUrl = `https://picsum.photos/${Math.random}/picsum/200`
  } else {
    photoAttribution = place.photos[0].html_attributions.map((a) => a.match(/<a.*>(.*)<\/a>/)[1]).join(',')
    photoUrl = getPhotoUrl(place.photos[0].photo_reference)
  }

  const params = {
    place_id: place.place_id,
    name: place.name,
    address: place.formatted_address,
    location: {
      type: 'Point',
      coordinates: [place.geometry.location.lng, place.geometry.location.lat]
    },
    photo_url: photoUrl,
    photo_attribution: photoAttribution
  }
  const res = await model.Restaurant.findOneAndUpdate({ place_id: place.place_id }, params, { upsert: true, returnDocument: 'after' }).lean()
  return res
}
