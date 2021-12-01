export default class ErrorRes {
  constructor (message) {
    this.name = 'UserError'
    this.message = message
    this.stack = (new Error()).stack
  }
}
