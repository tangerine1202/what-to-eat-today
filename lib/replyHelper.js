import client from '../config/lineClient.js'
import ErrorRes from '../lib/errorRes.js'
import { getLocationUrl } from './googleApi.js'

export function replyText (replyToken, text) {
  const message = { type: 'text', text }
  return client.replyMessage(replyToken, message)
}

export function replyCarousel (replyToken, restaurants, actionGetters = [], lastColumn = null) {
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
      actions: actionGetters.map(getAction => getAction(restaurant))
    }
    columns.push(column)
  }

  if (lastColumn) {
    columns.push(lastColumn)
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

export function getViewActionGetter () {
  return function (restaurant) {
    return {
      type: 'uri',
      label: 'View in Map',
      uri: getLocationUrl(restaurant.name, restaurant.place_id)
    }
  }
}

export function getRemoveActionGetter () {
  return function (restaurant) {
    const data = {
      command: 'remove',
      place_id: restaurant.place_id
    }
    return {
      type: 'postback',
      label: 'Remove',
      data: JSON.stringify(data)
    }
  }
}

export function getMoreActionGetter (command, limit = 5, offset = 0, distance = 3000, joinCodes = []) {
  if (!command) {
    throw new ErrorRes('Command is required')
  }
  return function () {
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

export function getMoreColumn (command, limit = 5, offset = 0, distance = 3000, joinCodes = []) {
  let text = `Current offset is ${offset}.`
  if (joinCodes.length !== 0) {
    text = `${text}\nJoin with ${joinCodes.join(', ')}.`
  }
  return {
    thumbnailImageUrl: 'https://cdn.pixabay.com/photo/2020/03/22/15/19/arrow-4957484_1280.png',
    title: 'See more',
    text: text,
    actions: [getMoreActionGetter(command, limit, offset, distance, joinCodes)()]
  }
}
