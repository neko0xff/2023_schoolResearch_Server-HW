API格式
===
## 01 部署
### 取得專案
- push local 
  ```
    $ git clone https://github.com/zangmen/2023_schoolSideProject.git
  ```
- 到專案資料夾
  ```
    $ cd 2023_schoolSideProject/src/sensor_api
  ```
### 更新專案
- fetch
  ```
    $ git fetch
  ```
- pull
  ```
    $ git pull
  ```
### 映像檔
- 建立映像檔
  ```
    $ sudo sh build.sh
  ```
- 建立且運行容器
  ```
    $ sudo sh run.sh
  ```
- 防火牆
  ```
    $ sudo firewall-cmd --add-port=3095/tcp --permanent
    $ sudo firewall-cmd --reload
  ```
---
## 02 環境&位置
### 環境: docker
- 把環境容器化
  * API串接的伺服端: nodejs
    * Port: 3095 
  * OS: Alpine
### 架構演示
![](https://i.imgur.com/Kxq8OFv.png)
### 伝送方式
![](https://i.imgur.com/3GlPMjG.png)
- 參數
  * `:deviceID`: 開發版編號
  * `?`: Quary String
  * `&`: Separator
  * 定義: 變數名=要傳伝的值
![](https://i.imgur.com/WNnxPKK.png)
---
## 03 開發版上傳
### 方式 
- HTTP Request: Post
- URL
  ```url
     /upload/:deviceID/data?[Quary String] 
  ```
### 輸入
- 格式: 字串 
- 動作: 送出請求+欲想傳送的㯗位
  * Quary String Value
    * hum
    * temp
    * tvoc
    * co2
    * co
    * pm25
### 輸出
- 格式: JSON
- 動作: 成功回傳時,則回應上傳的中繼資料
---
## 04 從資料庫讀值
### 方式 
- HTTP Request: GET
- URL
  ```
     /read/:deviceID/[api request]
  ```
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想查詢的部分  
  * 可查詢的部分
    * hum
    * temp
    * tvoc
    * co
    * co2
    * pm25
### 輸出
- 回傳格式: JSON
- 動作: 成功回傳時，則回應對應的請求
  * API Request
    | Request | return Value |
    |:-------:|:------------:|
    | '/hum'  |     hum      |
    | '/temp' |     temp     |
    | '/tvoc' |     tvoc     |
    |  '/co'  |      co      |
    | '/co2'  |     co2      |
    | '/pm25' |     pm2.5    |

---
## 05 開関控制
### 方式 
- HTTP Request: GET
- URL
  ```
     /switchCtr/:deviceID/[api request]
  ```
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想控制的部分  
  * 可查詢的部分
    * Status
### 輸出
- 回傳格式: String
- 動作: 成功回傳時，則回應對應的請求
  * API Request
    | Request |      return Value      |
    |:-------:|:----------------------:|
    |    1    | `[deviceID] is On `  |
    |    0    | `[deviceID] is Off ` |
---
## 06 檢視開関控制的記錄
### 方式 
- HTTP Request: GET
- URL
  ```
     /StatusRec/:deviceID/view
  ```
### 輸入
- 僅送出請求
### 輸出
- 回傳格式: JSON
- 動作: 成功回傳時，則回應對應的請求
---
## 07 資料庫連線測試
### 方式 
- HTTP Request: GET
- URL
  ```
     /testDB
  ```
### 輸入
- 僅送出請求
### 輸出
- 格式: 字串 
- 動作: 成功回傳時,則回應`The solution is: 2`