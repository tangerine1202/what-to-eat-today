import client from '../config/lineClient.js'
import ErrorRes from '../lib/errorRes.js'
import { getLocationUrl } from './googleApi.js'

export function replyCarousel (replyToken, restaurants) {
  if (!restaurants || restaurants.length === 0) {
    throw new ErrorRes('Number of restaurants cannot be 0 in replyCarousel()')
  }

  const columns = []

  for (const restaurant of restaurants) {
    let text = `${restaurant.address}\nPhoto by: ${restaurant.photo_attribution}`
    const title = restaurant.name

    // Validate max character limit
    // https://developers.line.biz/en/reference/messaging-api/#template-messages
    if (text.length > 60) text = `${text.substr(0, 57)}...`
    if (title.length > 40) text = `${title.substr(0, 37)}...`

    const column = {
      thumbnailImageUrl: restaurant.photo_url,
      title,
      text,
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
