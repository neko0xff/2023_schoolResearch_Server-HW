---
title: 四技專題-API格式
tags: 四技專題
---
四技專題-API格式
===
## 00 API 文件
### 檢視方式
- HTTP
  * 框架: Swagger
- URL: `/docs`
  ![](https://hackmd.io/_uploads/HkwHbADdh.png)
---
## 01 開發版上傳
### 方式 
- HTTP Request: POST
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL
  ```url
     /upload/:deviceID/data?[Quary String] 
  ```
### 輸入
- 格式: 字串 
- 動作: 送出請求+欲想傳送的㯗位
  * Body String Value
    | Value |   功能   |
    |:-----:|:--------:|
    |  hum  |   溫度   |
    | temp  |   溼度   |
    | tvoc  | 工業廢氣 |
    |  co   | 一氧化碳 |
    |  co2  | 二氧化碳 |
    | pm25  |  PM2.5   |
    |  o3   |   臭氧   |

### 輸出
- 格式: JSON
- 動作: 成功回傳時,則回應上傳的中繼資料
---
## 02 從資料庫讀值
### 方式 
- HTTP Request: GET
  * Params
- URL
  ```
     /read/:deviceID/[api request]
  ```
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想查詢的部分  
  * 可查詢的部分
    | Value |   功能   |
    |:-----:|:--------:|
    |  hum  |   溫度   |
    | temp  |   溼度   |
    | tvoc  | 工業廢氣 |
    |  co   | 一氧化碳 |
    |  co2  | 二氧化碳 |
    | pm25  |  PM2.5   |
    |  o3   |   臭氧   |
### 輸出
- 回傳格式: JSON
- 回應狀態
  |   Respose    | 表示方式 |
  |:------------:|:--------:|
  | 回傳相關資料 |   成功   |
  |     `-1`     |   錯誤   |
- 成功回傳時，則回應對應的請求
  * API Request
    | Request | Respose |
    |:-------:|:-------:|
    | '/hum'  |   hum   |
    | '/temp' |  temp   |
    | '/tvoc' |  tvoc   |
    |  '/co'  |   co    |
    | '/co2'  |   co2   |
    | '/pm25' |  pm2.5  |
    |  '/o3'  |   o3    |
    | '/ALL'  |  全部   |
    
---
## 03 開関控制
### 方式 
- HTTP Request: GET
  * Params
- URL
  ```
     /switchCtr/:deviceID/:switchID?[api request]
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
    | Request | Respose |       Console        |
    |:-------:|:-------:|:--------------------:|
    |    1    |    1    | `[deviceID] is On `  |
    |    0    |    0    | `[deviceID] is Off ` |
---
## 04 檢視開関控制的記錄
### 方式 
- HTTP Request: GET
  * Params
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
## 05 開發版讀取開關數值
### 方式 
- HTTP Request: GET
  * Params
- URL
  ```
     /StatusGet/:deviceID/:switchID/powerStatus
  ```
### 輸入
- 僅送出請求
### 輸出
- 回傳格式: JSON
- 動作: 成功回傳時，則回應對應的請求
   * API Request
     | Request | Respose |
     |:-------:|:-------:|
     |  1(開)  |    1    |
     |  0(関)  |    0    |
---
## 06 資料庫連線測試
### 方式 
- HTTP Request: GET
- URL: `/testDB`
### 輸入
- 僅送出請求
### 輸出
- 格式: 字串 
- 動作: 成功回傳時,則回應
  | Respose | 表示方式 |
  |:-------:|:--------:|
  |   `1`   |   成功   |
  |  `-1`   |   錯誤   |

---
## 07 使用者建立
### 方式 
- HTTP Request: POST
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/CreateUser`
### 輸入
- 格式: 字串
- 動作: 把需要建立的使用者資料送出
  * Body String Value
    |  送出變數   |    功能     |
    |:-----------:|:-----------:|
    | `username`  | 使用者帳戶  |
    | `password`  |    密碼     |
    | `LoginName` |  顯示名稱   |
    |   `email`   | 使用者email |

### 輸出
- 功能: 檢查使用者是否存在資料庫，若無則直接建立
- 格式: 字串 
- 動作: 成功回傳時,則回應
  | Respose | 表示方式 |
  |:-------:|:--------:|
  |   `1`   |   成功   |
  |   `0`   |   失敗   |
  |  `-1`   |   錯誤   |
---
## 08 使用者登入
### 方式 
- HTTP Request: POST
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/Login`
### 輸入
- 動作: 把需要核對的使用者資料送出
  * Body String Value
    |  送出變數  |    功能    |
    |:----------:|:----------:|
    | `username` | 使用者帳戶 |
    | `password` |    密碼    |
### 輸出
- 功能: 檢查使用者是否存在資料庫且比對傳送過來的資料是否一致
- 格式: 字串 
- 動作: 成功回傳時,則回應
  |   Respose    | 表示方式 |
  |:------------:|:--------:|
  | 回傳相關資料 |   成功   |
  |     `0`      |   失敗   |
  |     `-1`     |   錯誤   |
- 成功回傳時，則回應對應的請求
  * API Request
    |  Respose  |    表示     |
    |:---------:|:-----------:|
    |   code    | 1(成功回傳) |
    | username  | 使用者帳戶  |
    | Loginname |  顯示名稱   |
    |   email   | 使用者email |
    
---
## 09 使用者資料更新
### 方式 
- HTTP Request: POST
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/UpdateUserData`
### 輸入
- 動作: 把需要核對的使用者資料送出
  * Body String Value
    |  送出變數   |    功能     |
    |:-----------:|:-----------:|
    | `username`  | 使用者名稱  |
    | `password`  |    密碼     |
    | `LoginName` |  顯示名稱   |
    |   `email`   | 使用者email |
### 輸出
- 功能: 檢查使用者是否存在資料庫且比對傳送過來的資料是否一致
- 格式: JSON 
- 回應狀態
  | Respose | 表示方式 |
  |:-------:|:--------:|
  |   `1`   |   成功   |
  |   `0`   |   失敗   |
  |  `-1`   |   錯誤   |

---
## 10 使用者忘記密碼 
### 方式 
- HTTP Request: POST
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/emailAuthCheck`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想傳送的㯗位
  * Body String Value
    | 送出變數 |    功能     |
    |:--------:|:-----------:|
    | `email`  | 使用者email |

### 輸出
- 功能: 檢查使用者是否存在資料庫且比對傳送過來的資料是否一致
- 格式: JSON 
- 動作: 成功回傳時,則回應
  |   Respose    | 表示方式 |
  |:------------:|:--------:|
  | 回傳相關資料 |   成功   |
  |     `0`      |   失敗   |
  |     `-1`     |   錯誤   |
- 成功回傳時，則回應對應的請求
  * API Request
    |  Respose  |    表示     |
    |:---------:|:-----------:|
    |   code    | 1(成功回傳) |
    | username  | 使用者帳戶  |
    | Loginname |  顯示名稱   |
    |   email   | 使用者email |
---
## 11 記錄使用者的自訂值
### 方式 
- HTTP Request: POST
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/Set/UserCustomValue01`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想傳送的㯗位
  * 可查詢的部分
    |     Value     |     功能      |
    |:-------------:|:-------------:|
    |  `username`   |  使用者帳戶   |
    | `customvar01` | 使用者自訂值1 |
### 輸出
- 功能: 檢查使用者是否存在資料庫且比對傳送過來的資料是否一致
- 格式: JSON 
- 回應狀態
  | Respose | 表示方式 |
  |:-------:|:--------:|
  |   `1`   |   成功   |
  |   `0`   |   失敗   |
  |  `-1`   |   錯誤   |
---
## 12 查詢指定站點的AQI資料
### 方式 
- HTTP Request: GET
  * Params
- URL: `/crawler/AQI/site`
### 輸入
- 格式: 字串 
- 動作: 送出請求+欲想傳送的㯗位
  * 可查詢的部分
    |  Value   |      功能      |
    |:--------:|:--------------:|
    | sitename | 指定的測站名稱 |
### 輸出
- 功能: 檢查使用者是否存在資料庫且比對傳送過來的資料是否一致
- 格式: JSON 
- 回應狀態
  |   Respose    | 表示方式 |
  |:------------:|:--------:|
  | 回傳相關資料 |   成功   |
  |     `-1`     |   錯誤   |
- 成功回傳時，則回應對應的請求
  * API Request
    |   Respose   |   表示   |
    |:-----------:|:--------:|
    |   siteid    | 測站編號 |
    |  sitename   |  測站點  |
    |     aqi     |   AQI    |
    | monitordate |   Date   |
---
## 13 查詢使用者的自訂值
### 方式 
- HTTP Request: GET
  * Params
- URL: `/Read/UserCustomValue01?[api request]`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想查詢的部分  
  * 可查詢的部分
    * username
### 輸出
- 功能: 檢查使用者是否存在資料庫且比對傳送過來的資料是否一致
- 格式: JSON 
- 動作: 成功回傳時,則回應
  |   Respose    | 表示方式 |
  |:------------:|:--------:|
  | 回傳相關資料 |   成功   |
  |     `0`      |   失敗   |
  |     `-1`     |   錯誤   |
- 成功回傳時，則回應對應的請求
  * API Request
    |   Respose   |      表示      |
    |:-----------:|:--------------:|
    |    code     |  1(成功回傳)   |
    |  username   |   使用者帳戶   |
    | customvar01 | 使用者的自訂值 |
