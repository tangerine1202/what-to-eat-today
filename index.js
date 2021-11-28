'use strict'

import line from '@line/bot-sdk'
import express from 'express'
import config from './config/config.js'
import connectMongoDB from './config/mongo.js'
import controller from './controller/index.js'

connectMongoDB()

const app = express()

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.use(line.middleware(config.line))

app.post('/callback', (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err)
      res.status(500).end()
    })
})

// event handler
function handleEvent (event) {
  const eventType = event.type

  switch (eventType) {
    case 'follow':
      return controller.follow(event)
    case 'message':
      return controller.message(event)
    case 'postback':
      return Promise.resolve(null)
    default:
      console.log(`Unregistered event type: ${eventType}`)
      return Promise.resolve(null)
  }
}

// listen on port
app.listen(config.app.port, () => {
  console.log(`listening on ${config.app.port}`)
})
