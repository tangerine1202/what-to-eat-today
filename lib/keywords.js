const keywords = {
  addRestaurant: ['add', '新增'],
  getMyRestaurant: ['get', '我的餐廳'],
  removeRestaurant: ['remove', '移除'],
  chooseRestaurant: ['choose', '選擇'],
  randomRestaurant: ['random', '隨機'],
  exploreRestaurant: ['explore', '探索'],
  setJoinCode: ['setCode', '設定共享號碼'],
  updateLocation: ['updateLocation', '更新所在地'],
  help: ['help', '/', '說明', '使用說明', '指令說明'],
  operators: {
    distance: {
      prefix: ['in'],
      suffix: ['km', 'm']
    },
    joinCodes: {
      prefix: ['with'],
      suffix: []
    }
  }
}

function getAllOperatorPrefixes () {
  return Object.entries(keywords.operators).flatMap(([key, value]) => (value.prefix))
}

export {
  keywords,
  getAllOperatorPrefixes
}
