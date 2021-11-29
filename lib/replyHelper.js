import client from '../config/lineClient.js'
import ErrorRes from '../lib/errorRes.js'
import { getLocationUrl } from './googleApi.js'

export function replyCarousel (replyToken, restaurants) {
  if (!restaurants || restaurants.length === 0) {
    throw new ErrorRes('Number of restaurants cannot be 0 in replyCarousel()')
  }

  const columns = []

  for (const restaurant of restaurants) {
    const column = {
      thumbnailImageUrl: restaurant.photo_url,
      title: restaurant.name,
      text: `${restaurant.address}\nPhoto by: ${restaurant.photo_attribution}`,
      actions: [{
        type: 'uri',
        label: 'view in map',
        uri: getLocationUrl(restaurant.address, restaurant.place_id)
      }]
    }
    columns.push(column)
  }

  return client.replyMessage(replyToken, {
    type: 'template',
    altText: 'carousel of restaurants',
    template: {
      type: 'carousel',
      columns
    }
  })
}
