import mongoose from 'mongoose'
import config from './config.js'

async function connectMongoDB () {
  try {
    const connectionURL = `${config.mongo.schema}://${config.mongo.username}:${config.mongo.password}@${config.mongo.host}`

    mongoose.connection.on('connected', () => {
      console.log('=== MongoDB is connected ===')
    })

    mongoose.connection.on('disconnected', () => {
      console.log('=== MongoDB is disconnected ===')
    })

    mongoose.connection.on('close', () => {
      console.info('=== MongoDB connection closed ===')
    })

    mongoose.connection.on('error', (error) => {
      console.error(`=== MongoDB connection error ===\n${error}`)
      process.exit(1)
    })

    await mongoose.connect(connectionURL, { dbName: config.mongo.database, useNewUrlParser: true, useUnifiedTopology: true })
  } catch (err) {
    console.error(err)
    throw new Error('Failed to connect to the MongoDB')
  }
}

export default connectMongoDB
