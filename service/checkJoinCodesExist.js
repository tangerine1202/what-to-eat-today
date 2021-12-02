import model from '../model/index.js'

export default async function checkJoinCodesExist (joinCodes = []) {
  try {
    const users = await model.User.find({ join_code: { $in: joinCodes } }).lean().exec()
    const existCodes = users.map(user => user.join_code)
    const notExistCodes = joinCodes.filter(code => !existCodes.includes(code))
    return { ok: (notExistCodes.length === 0), notExistCodes }
  } catch (err) {
    console.log(err)
    throw new Error('Failed to get join codes from database')
  }
}
