2023_專題-後端&硬體 
===
## 內容
- 主題: IOT+空氣品質分析
- 資料夾
  * '/src': 專題程式
  * '/src/serverConfig': 環境設置
  * '/doc': 功能文件
---
## 程式
- 爬蟲: '/src/Server/crawlerData'
  * 使用語言
      * Old: nodejs(JavaScrpit)
      * New: deno(JavaScrpit)
  * docker image: Alpine
- IoT Gateway: '/src/Server/IoTGateway'
  * 使用語言
      * Old: nodejs(JavaScrpit)
      * New: deno(JavaScrpit)
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
- 使用者
  * 登入
  * 建立
  * 修改
- IoT 
  * 接收感測器數值
  * 查詢己入資料庫的各項數值
  * 控制開關
- 爬蟲
  * 抓取隔天的AQI數值
