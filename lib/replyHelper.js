import client from '../config/lineClient.js'
import { getLocationUrl } from './googleApi.js'

export function replyText (replyToken, text, quickReply = null) {
  const message = { type: 'text', text }
  if (quickReply && Object.prototype.hasOwnProperty.call(quickReply, 'quickReply')) {
    Object.assign(message, quickReply)
  }
  return client.replyMessage(replyToken, message)
}

export function replyLocation (replyToken, title, address, latitude, longitude) {
  return client.replyMessage(replyToken, {
    type: 'location',
    title,
    address,
    latitude,
    longitude
  })
}

export function replyCarousel (replyToken, restaurants, actionFactories = [], lastColumn = null, quickReply) {
  if (!restaurants || restaurants.length === 0) {
    throw new Error('Number of restaurants cannot be 0')
  }
  if (actionFactories.length > 3) {
    throw new Error('Number of actions cannot > 3')
  }

  const columns = []

  for (const restaurant of restaurants) {
    let title = restaurant.name
    let text = `${restaurant.address}\nPhoto by: ${restaurant.photo_attribution}`

    // Validate max character limit
    // https://developers.line.biz/en/reference/messaging-api/#template-messages
    if (title.length > 40) title = `${title.substr(0, 37)}...`
    if (text.length > 60) text = `${text.substr(0, 57)}...`

    const column = {
      thumbnailImageUrl: restaurant.photo_url,
      title,
      text,
      defaultAction: viewActionFactory()(restaurant),
      actions: actionFactories.map(getAction => getAction(restaurant))
    }
    columns.push(column)
  }
  if (lastColumn) {
    columns.push(lastColumn)
  }

  const message = {
    type: 'template',
    altText: 'carousel of restaurants',
    template: {
      type: 'carousel',
      columns
    }
  }
  if (quickReply && Object.prototype.hasOwnProperty.call(quickReply, 'quickReply')) {
    Object.assign(message, quickReply)
  }

  return client.replyMessage(replyToken, message)
}

export function getQuickReply (actionFactories = []) {
  if (actionFactories.length === 0) return null
  return {
    quickReply: {
      items: actionFactories.map(getAction => ({ type: 'action', action: getAction() }))
    }
  }
}

export function getMoreColumn (command, limit = 5, offset = 0, distance = 3000, joinCodes = []) {
  let text = `Offset: ${offset}`
  if (joinCodes.length !== 0) {
    text = `${text}\nJoin: ${joinCodes.join(', ')}`
  }
  return {
    thumbnailImageUrl: 'https://cdn.pixabay.com/photo/2020/03/22/15/19/arrow-4957484_1280.png',
    title: 'See more',
    text: text,
    actions: [moreActionFactory(command, limit, offset, distance, joinCodes)()]
  }
}

export function updateLocationActionFactory (label = '更新所在地') {
  return () => ({
    type: 'location',
    label
  })
}

export function viewActionFactory () {
  return (restaurant) => ({
    type: 'uri',
    label: '📍 View in Map',
    uri: getLocationUrl(restaurant.name, restaurant.place_id)
  })
}

export function removeActionFactory () {
  return (restaurant) => {
    const data = {
      command: 'remove',
      placeId: restaurant.place_id
    }
    return {
      type: 'postback',
      label: '❌ Remove',
      data: JSON.stringify(data)
    }
  }
}

export function moreActionFactory (command, limit = 5, offset = 0, distance = 3000, joinCodes = []) {
  if (!command) {
    throw new Error('Command is required')
  }
  return () => {
    const data = {
      command,
      offset: offset + limit,
      limit,
      distance,
      joinCodes
    }
    return {
      type: 'postback',
      label: '👉 More',
      data: JSON.stringify(data)
    }
  }
}
