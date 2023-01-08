# API
## 環境&位置
- 環境: docker
  * nodejs
    * Port: 3000 
  * Fedora
    ![](https://i.imgur.com/Kxq8OFv.png)
- 伝送方式
  ![](https://i.imgur.com/3GlPMjG.png)
- 參數
  * `:deviceID`: 開發版編號
  * `?`: Quary String
    ![](https://i.imgur.com/WNnxPKK.png)
---
## 開發版
### 上傳
- HTTP Request: Post
- URL
  ```url
     /upload/:deviceID/data?[Quary String] 
  ```
- Quary String Value
  * hum
  * temp
  * tvoc
  * co2
---
## 讀值
- HTTP Request: GET
- URL
  ```
     /read/:deviceID/[api request]
  ```
- API Request
  | Request | return Value |
  |:-------:|:------------:|
  | '/hum'  |     hum      |
  | '/temp' |     temp     |
  | '/tvoc' |     tvoc     |
  | '/co2'  |     co2      |
