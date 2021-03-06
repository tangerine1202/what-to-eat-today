import fetch from 'node-fetch'
import config from '../config/config.js'

export async function findPlace (text, latitude, longitude) {
  const baseUrl = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
  const fields = ['place_id', 'formatted_address', 'geometry', 'name', 'photo']
  const params = {
    key: config.google.apiKey,
    input: encodeURIComponent(text),
    inputtype: 'textquery',
    fields: encodeURIComponent(fields.join(',')),
    language: 'zh-TW',
    locationbias: encodeURIComponent(`point:${latitude},${longitude}`)
  }
  const query = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')
  const url = `${baseUrl}?${query}`

  try {
    const res = await fetch(url)
    const { candidates, status, error_message: errorMessage } = await res.json()

    if (status === 'ZERO_RESULTS') {
      return null
    } else if (status !== 'OK') {
      throw new Error(`Failed to fetch place information from Google Api. ${JSON.stringify({ status, errorMessage })}`)
    }

    return candidates[0]
  } catch (err) {
    console.error(err)
    throw new Error('Failed to fetch place information from Google Api')
  }
}

export function getLocationUrl (query, placeId = null) {
  // ref: https://developers.google.com/maps/documentation/urls/get-started#search-action
  if (!placeId) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&query_place_id=${placeId}`
}

export function getPhotoUrl (photoReference, maxWidth = 400) {
  const baseUrl = 'https://maps.googleapis.com/maps/api/place/photo'
  const params = {
    maxwidth: maxWidth,
    photo_reference: photoReference,
    key: config.google.apiKey
  }
  const query = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')
  return `${baseUrl}?${query}`
}
