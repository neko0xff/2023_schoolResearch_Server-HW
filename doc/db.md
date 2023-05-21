資料庫格式
===
## 名稱
- 資料庫: `sensorDB`
- 資料表
  1. `[:device_ID]_Table`: 感測器回伝的資料
  2. `[:device_ID]_Status`: 開関
  3. `[:device_ID]_StatusRec`: 開関記錄
- 裝置
  * Sensor01
  * Switch01
--- 
## 資料表格式
- Sensor01_Table
  | 資料庫欄位 |  型態  | 中文名稱 |
  |:----------:|:------:|:--------:|
  |     id     |  int   |   筆數   |
  |    hum     | double |   溼度   |
  |    temp    | double |   溫度   |
  |    tvoc    | double |   tvoc   |
  |     co     | double |    co    |
  |    co2     | double |   co2    |
  |    date    |  date  |   日期   |
  |    time    |  time  |   時間   |
- Switch01_Status
  | 資料庫欄位 |      型態       | 中文名稱 |
  |:----------:|:---------------:|:--------:|
  |     id     |       int       |   筆數   |
  |   switch   | Varchar(String) |  関関名  |
  |   status   |       int       |   狀態   |
- Switch01_StatusRec
  | 資料庫欄位 |      型態       | 中文名稱 |
  |:----------:|:---------------:|:--------:|
  |     id     |       int       |   筆數   |
  |   switch   | Varchar(String) |  関関名  |
  |   status   |       int       |   狀態   |
  |    date    |      date       |   日期   |
  |    time    |      time       |   時間   |