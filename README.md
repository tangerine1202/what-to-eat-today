# What To Eat Today 今天吃什麼
> 「加入你的口袋名單，下一餐吃什麼交給 LINE Bot 來煩惱！」 - What To Eat Today

「What To Eat Today」是一個幫你選擇下一餐要吃什麼的 LINE Bot。

## Table of Content
- [開始使用](#開始使用)
- [功能](#功能)
- [範例](#範例)
- [Setup & Run](#Setup-amp-Run)
- [參考資料](#參考資料)
- [指令說明](#指令說明)

## 開始使用
[<img src="https://qr-official.line.me/sid/L/968sbntg.png" width=200pxx />](https://liff.line.me/1645278921-kWRPP32q/?accountId=968sbntg)

[LINE ID: @968sbntg](https://liff.line.me/1645278921-kWRPP32q/?accountId=968sbntg)

## 功能
- 新增多間自己喜愛的餐廳。
- 辛苦一天吃飯不想跑太遠？限定只選擇範圍內的餐廳。
- 與朋友一起吃飯，共同參考朋友喜愛的餐廳。
- 探索附近人們都吃些什麼好吃的。

## 範例
> *新增餐廳*

<img src=https://i.imgur.com/mEKwcDm.jpg width=400px />

> *隨機選擇餐廳*

<img src=https://i.imgur.com/gDchgC1.jpg width=400x />

> *選擇餐廳（with 朋友，限定 300 m 以內的餐廳）*


<img src=https://s10.gifyu.com/images/ezgif.com-gif-maker4513129be5e949f0.gif width=400x />


## Setup & Run

### Local

1. 安裝 [Node.js (v14)、npm](https://nodejs.org/en/)、[Docker Compose V2](https://docs.docker.com/compose/cli-command/)。
3. 依照 `.env.example` 設定環境變數，並放入 `.env` 中。

```shell
git clone https://github.com/tangerine1202/what-to-eat-today
cd what-to-eat-today
docker compose up
npm install
npm start
```

- [ ] update repo link

### Heroku

- 參考 [Heroku](https://devcenter.heroku.com/articles/git) 的文件。
- 可使用 `setHerokuVars.sh` 快速將 `.env.prod` 中的環境變數設定到 Heroku 上。


## 參考資料
- [LINE Messaging API](https://developers.line.biz/en/reference/messaging-api/)
- [Google Place Search API](https://developers.google.com/maps/documentation/places/web-service/search)
- [Mongoose](https://mongoosejs.com/)



## LINE Bot 指令說明

目前支援的指令：
- [`新增`, `add`](#新增餐廳)
- [`選擇`, `choose`](#選擇餐廳)
- [`隨機`, `random`](#隨機選擇餐廳)
- [`探索`, `explore`](#探索餐廳)
- [`我的餐廳`, `get`](#取得我的餐廳)
- [`移除`, `remove`](#移除餐廳)
- [`設定共享號碼`, `setCode`](#設定共享號碼)
- [`更新所在地`, `updateLocation`](#更新所在地)
- `說明`, `help`

### 新增餐廳
新增你喜愛的餐廳。

```
<新增/add> <餐廳名> [餐廳名...]

注意：
- 餐廳名稱中間不能有空格。
- 一次最多新增五間餐廳。
```


### 選擇餐廳
讓 LINE bot 幫你選擇餐廳。

```
<選擇/choose> [in <num> <m/km>] [with <共享號碼> [共享號碼...]]

注意：
- 一次最多參考四位好友的餐廳名單。
- 預設搜尋三公里內的餐廳。

Tips：
- 使用「in 3 km」來選定搜索範圍。
- 使用「with 共享號碼」一同參考好友的餐廳名單。
```


### 隨機選擇餐廳
讓 LINE bot 隨機選擇一間餐廳。
```
<隨機/random> [in <num> <m/km>] [with <共享號碼> [共享號碼...]]

Tips：
- 使用「in 3 km」來選定搜索範圍。
- 使用「with 共享號碼」一同參考好友的餐廳名單。

注意：
- 一次最多參考四位好友的餐廳名單。
- 預設搜尋三公里內的餐廳。
```


### 探索餐廳
探索附近別人都吃些什麼。

```
<探索/explore> [in <num> <m/km>]

Tip：
- 使用「in 3 km」來選定搜索範圍。

注意：
- 預設搜尋三公里內的餐廳。
```


### 取得我的餐廳
列出所有你喜愛的餐廳。

```
<我的餐廳/get>
```

### 移除餐廳
移除你喜愛的餐廳。

```
<移除/remove> <餐廳名> [餐廳名...]

注意：
- 餐廳名稱中間不能有空格。
- 一次最多移除五間餐廳。
```

### 設定共享號碼
設定與好友分享餐廳名單用的共享號碼。

```
<設定共享號碼/setCode> <共享號碼>

注意：
- 僅能使用英文字母（a-zA-Z）、數字（0-9）、底線（_）。
- 長度需介於 4 到 8 位之間。
```


### 更新所在地
更新你的所在地，以便 LINE Bot 提供更好的使用體驗。

```
點擊左下角「＋」再點擊「位置資訊」，並分享給 LINE Bot。
```

<img src=https://i.imgur.com/Lx6PBTg.jpg width=300x />

<img src=https://i.imgur.com/X1KMYTR.jpg width=300x />

<img src=https://i.imgur.com/vNM0L8t.jpg width=300x />