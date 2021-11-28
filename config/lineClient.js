import line from '@line/bot-sdk'
import config from './config.js'

export default new line.Client(config.line)
