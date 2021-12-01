import { keywords } from '../lib/keywords.js'
import { getQuickReply, replyText, updateLocationActionFactory } from '../lib/replyHelper.js'

export default function (replyToken, { command = '' }) {
  const addMessage = [
    '# 新增餐廳',
    '新增你喜愛的餐廳。',
    '',
    '格式：<新增/add> <餐廳名> [餐廳名...]',
    '',
    '注意：',
    '- 餐廳名稱中不能有空格。',
    '- 一次最多新增五間餐廳。'
  ].join('\n')
  const chooseMessage = [
    '# 選擇餐廳',
    '讓 Line bot 幫你選擇餐廳。',
    '',
    '格式：',
    '<選擇/choose> [in <num> <m/km>] [with <共享號碼> [共享號碼...]]',
    '',
    'Tips：',
    '- 使用「in 3 km」來選定搜索範圍。',
    '- 使用「with 共享號碼」一同參考好友的餐廳名單。',
    '',
    '注意：',
    '- 一次最多參考四位好友的餐廳名單。'
  ].join('\n')
  const exploreMessage = [
    '# 探索餐廳',
    '探索附近別人都吃些什麼。',
    '',
    '格式：',
    '<探索/explore> [in <num> <m/km>]',
    '',
    'Tip：',
    '- 使用「in 3 km」來選定搜索範圍。'
  ].join('\n')
  const getMessage = [
    '# 取得我的餐廳',
    '列出所有你喜愛的餐廳。',
    '',
    '格式：<我的餐廳/get>'
  ].join('\n')
  const removeMessage = [
    '# 移除餐廳',
    '移除你喜愛的餐廳。',
    '',
    '格式：',
    '<移除/remove> <餐廳名> [餐廳名...]',
    '',
    '注意：',
    '- 餐廳名稱中間不能有空格。',
    '- 一次最多移除五間餐廳。'
  ].join('\n')
  const setCodeMessage = [
    '# 設定共享號碼',
    '設定與好友分享餐廳名單用的共享號碼。',
    '',
    '格式：',
    '<設定共享號碼/setCode> <共享號碼>',
    '',
    '注意：',
    '- 僅能使用英文字母（a-zA-Z）、數字（0-9）、底線（_）。',
    '- 長度需介於 4 到 8 位之間。'
  ].join('\n')
  const updateLocationMessage = [
    '# 更新所在地',
    '更新你的所在地，以便 Line Bot 提供更好的使用體驗。',
    '',
    '說明：',
    '點擊左下角「＋」再點擊「位置資訊」，並分享給 Line Bot。'
  ].join('\n')
  const helpMessage = [
    '# 指令說明',
    '格式：<說明/help> <指令名>',
    '',
    '目前支援的指令：',
    ['- 新增, add',
      '選擇, choose',
      '探索, explore',
      '我的餐廳, get',
      '移除, remove',
      '設定共享號碼, setCode',
      '更新所在地, updateLocation',
      '說明, help'
    ].join('\n- ')
  ].join('\n')

  let message = ''
  let quickReply = null
  if (keywords.addRestaurant.includes(command)) {
    message = addMessage
  } else if (keywords.chooseRestaurant.includes(command)) {
    message = chooseMessage
  } else if (keywords.exploreRestaurant.includes(command)) {
    message = exploreMessage
  } else if (keywords.getMyRestaurant.includes(command)) {
    message = getMessage
  } else if (keywords.removeRestaurant.includes(command)) {
    message = removeMessage
  } else if (keywords.setJoinCode.includes(command)) {
    message = setCodeMessage
  } else if (keywords.updateLocation.includes(command)) {
    message = updateLocationMessage
    quickReply = getQuickReply([updateLocationActionFactory()])
  } else {
    message = helpMessage
  }
  return replyText(replyToken, message, quickReply)
}
