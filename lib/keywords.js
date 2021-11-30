const keywords = {
  addRestaurant: ['add', '新增餐廳'],
  removeRestaurant: ['remove', '移除餐廳'],
  chooseRestaurant: ['choose', '選擇餐廳'],
  exploreRestaurant: ['explore', '探索餐廳'],
  setJoinCode: ['setCode', '設定共享號碼'],
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
