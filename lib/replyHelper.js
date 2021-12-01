import client from '../config/lineClient.js'
import ErrorRes from '../lib/errorRes.js'
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

export function replyCarousel (replyToken, restaurants, actionGetters = [], lastColumn = null, quickReply) {
  if (!restaurants || restaurants.length === 0) {
    throw new ErrorRes('Number of restaurants cannot be 0')
  }
  if (actionGetters.length > 3) {
    throw new ErrorRes('Number of actions cannot > 3')
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
      defaultAction: getViewAction(restaurant),
      actions: actionGetters.map(getAction => getAction(restaurant))
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

export function getQuickReply (actionGetters = []) {
  if (actionGetters.length === 0) return null
  return {
    quickReply: {
      items: actionGetters.map(getAction => ({ type: 'action', action: getAction() }))
    }
  }
}

export function getMoreColumn (command, limit = 5, offset = 0, distance = 3000, joinCodes = []) {
  let text = `Current offset is ${offset}.`
  if (joinCodes.length !== 0) {
    text = `${text}\nJoin with ${joinCodes.join(', ')}.`
  }
  return {
    thumbnailImageUrl: 'https://cdn.pixabay.com/photo/2020/03/22/15/19/arrow-4957484_1280.png',
    title: 'See more',
    text: text,
    actions: [getMoreAction(command, limit, offset, distance, joinCodes)()]
  }
}

export function getUpdateLocationAction (label = '距離遙遠，更新一下所在地？') {
  return () => ({
    type: 'location',
    label
  })
}

export function getViewAction () {
  return (restaurant) => ({
    type: 'uri',
    label: 'View in Map',
    uri: getLocationUrl(restaurant.name, restaurant.place_id)
  })
}

export function getRemoveAction () {
  return (restaurant) => {
    const data = {
      command: 'remove',
      placeId: restaurant.place_id
    }
    return {
      type: 'postback',
      label: 'Remove',
      data: JSON.stringify(data)
    }
  }
}

export function getMoreAction (command, limit = 5, offset = 0, distance = 3000, joinCodes = []) {
  if (!command) {
    throw new ErrorRes('Command is required')
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
      label: 'More',
      data: JSON.stringify(data)
    }
  }
}
