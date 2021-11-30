import dotenv from 'dotenv'

dotenv.config()

export default {
  app: {
    port: process.env.PORT
  },
  line: {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY
  },
  mongo: {
    schema: process.env.MONGO_SCHEMA,
    host: process.env.MONGO_HOST,
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    database: process.env.MONGO_DATABASE
  }
}
