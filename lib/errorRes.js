export default class ErrorRes {
  constructor (message) {
    this.name = 'CustomError'
    this.message = message
    this.stack = (new Error()).stack
  }
}
