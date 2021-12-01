import model from '../model/index.js'
import ErrorRes from '../lib/errorRes.js'
import { findPlace, getPhotoUrl } from '../lib/googleApi.js'
import { replyText, replyCarousel, removeActionFactory, getQuickReply, updateLocationActionFactory } from '../lib/replyHelper.js'
import { calculateLatLngDistance } from '../lib/utils.js'

export default async function addRestaurant (replyToken, { userId, customNames }) {
  const user = await model.User.findOne({ user_id: userId }).lean()
  const nameOfUserRestaurants = user.restaurants.map((e) => e.custom_name)
  const placeIdOfUserRestaurants = user.restaurants.map((e) => e.place_id)
  const placeProcesses = []
  const namePlaceMapping = {}
  const unSeenNames = []
  const duplicatedNames = []
  const noResultNames = []
  let shouldUpdateLocation = false

  for (const name of customNames) {
    // 1. remove duplicated user restaurants with custom name
    if (nameOfUserRestaurants.includes(name)) {
      duplicatedNames.push(name)
      continue
    }
    // 2. fetch place information from Find Place Api
    unSeenNames.push(name)
    placeProcesses.push(findPlace(name, user.location.coordinates[1], user.location.coordinates[0]))
  }

  // 3. remove duplicated user restaurants with place_id
  const responses = await Promise.all(placeProcesses)
  for (const [idx, place] of Object.entries(responses)) {
    if (place === null) {
      noResultNames.push(unSeenNames[idx])
    } else if (placeIdOfUserRestaurants.includes(place.place_id)) {
      duplicatedNames.push(unSeenNames[idx])
    } else {
      namePlaceMapping[unSeenNames[idx]] = responses[idx]
      if (!shouldUpdateLocation && calculateLatLngDistance(
        user.location.coordinates[1],
        user.location.coordinates[0],
        place.geometry.location.lat,
        place.geometry.location.lng
      ) > 5000) {
        shouldUpdateLocation = true
      }
    }
  }

  try {
    if (Object.keys(namePlaceMapping).length === 0) {
      let text = '未新增任何餐廳QQ'
      if (noResultNames.length !== 0) {
        text = text.concat('\n\n', `以下名稱找不到餐廳，請查明後再播（？）\n- ${noResultNames.join('\n- ')}`)
      }
      if (duplicatedNames.length !== 0) {
        text = text.concat('\n\n', `以下餐廳已新增過囉～\n- ${duplicatedNames.join('\n- ')}`)
      }
      return replyText(replyToken, text)
    }
    // 4. update Restaurant
    const restaurants = await Promise.all(Object.values(namePlaceMapping).map(addPlaceToRestaurant))
    // 5. update User.restaurants
    const newUserRestaurants = [...user.restaurants]
    Object.entries(namePlaceMapping).map(([name, place]) => newUserRestaurants.push({ custom_name: name, place_id: place.place_id }))
    await model.User.updateOne({ user_id: userId }, { restaurants: newUserRestaurants })

    let quickReply = null
    if (shouldUpdateLocation) {
      quickReply = getQuickReply([updateLocationActionFactory()])
    }

    // TODO: handle duplicated names, at least give some feedback to let user know we have processed them
    return replyCarousel(replyToken, restaurants, [removeActionFactory()], null, quickReply)
  } catch (err) {
    console.error(err)
    throw new ErrorRes('Failed to add restaurant to database')
  }
}

async function addPlaceToRestaurant (place) {
  let photoUrl, photoAttribution
  if (!place.photos || place.photos.length === 0) {
    photoAttribution = 'Unsplash'
    photoUrl = `https://picsum.photos/seed/${Math.random()}/200`
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
