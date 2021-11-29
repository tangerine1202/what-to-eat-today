import mongoose from 'mongoose'
import config from './config.js'
import ErrorRes from '../lib/errorRes.js'

async function connectMongoDB () {
  try {
    const connectionURL = `mongodb://${config.mongo.username}:${config.mongo.password}@${config.mongo.host}:${config.mongo.port}`
    await mongoose.connect(connectionURL, { dbName: config.mongo.database })
    console.log('=== MongoDB is connected ===')
  } catch (err) {
    console.error(err)
    throw new ErrorRes('Failed to connect to the MongoDB')
  }
}

export default connectMongoDB