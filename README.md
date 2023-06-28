2023_專題-後端&硬體 
===
## 內容
- 主題: IOT+空氣品質分析
- 資料夾
  * '/src': 專題程式
  * '/serverConfig': 環境設置
  * '/doc': 功能文件
---
## 程式
- IoT Gateway: '/src/sensor-api'
  * 使用語言： nodejs(JavaScrpit)
  * docker image: Alpine
  * 通信協定
    1. HTTP API
    2. MQTT
- 硬體: '/src/Arduino' 
  * 開發版
    1. ESP32
    2. ESP8266
---
## 處理資料
- 使用者登入/建立
- 感測器
 | Value |   功能   |
 |:-----:|:--------:|
 |  hum  |   溫度   |
 | temp  |   溼度   |
 | tvoc  | 工業廢氣 |
 |  co   | 一氧化碳 |
 |  co2  | 二氧化碳 |
 | pm25  |  PM2.5   |
 |  o3   |   臭氧   |
---