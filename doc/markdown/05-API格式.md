API格式
===

## 00 API 文件
### 檢視方式
- HTTP
  * 框架: Swagger
- URL: `/docs`
  ![](https://hackmd.io/_uploads/HkwHbADdh.png)

## 01 開發版上傳
### 方式
- HTTP Request: POST
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL
  ```url
     /upload/:deviceID/data
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

## 03 開関控制
### 方式
- HTTP Request: GET
  * Params
- URL
  ```
     /set/switchCtr/:deviceID/:switchID?[api request]
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

## 04 檢視開関控制的記錄
### 方式
- HTTP Request: GET
  * Params
- URL
  ```
     /read/StatusRec/:deviceID/view
  ```
### 輸入
- 僅送出請求
### 輸出
- 回傳格式: JSON
- 動作: 成功回傳時，則回應對應的請求

## 05 開發版讀取開關數值
### 方式
- HTTP Request: GET
  * Params
- URL
  ```
     /read/StatusGet/:deviceID/:switchID/powerStatus
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

## 07 使用者建立
### 方式
- HTTP Request: POST
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/auth/CreateUser`
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
- 格式: JSON
- 動作: 成功回傳時,則回應
  | Respose | 表示方式 |
  |:-------:|:--------:|
  |   `1`   |   成功   |
  |   `0`   |   失敗   |
  |  `-1`   |   錯誤   |

## 08 使用者登入
### 方式
- HTTP Request: POST
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/auth/Login`
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

## 09 使用者資料更新
### 方式
- HTTP Request: POST
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/auth/UpdateUserData`
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

## 10 使用者忘記密碼
### 方式
- HTTP Request: POST
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/auth/emailAuthCheck`
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

## 11 記錄使用者的自訂值
### 方式
- HTTP Request: POST
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/set/UserCustomValue`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想傳送的㯗位
  * 可查詢的部分
    |    Value    |            功能            |
    |:-----------:|:--------------------------:|
    | `username`  |         使用者帳戶         |
    | ValueName | 指定查詢的使用者自訂值名稱 |
    |     num     |            數值            |
### 輸出
- 功能: 檢查使用者是否存在資料庫且比對傳送過來的資料是否一致
- 格式: JSON
- 回應狀態
  | Respose | 表示方式 |
  |:-------:|:--------:|
  |   `1`   |   成功   |
  |   `0`   |   失敗   |
  |  `-1`   |   錯誤   |

## 12 查詢指定站點的AQI資料
### 方式
- HTTP Request: GET
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/read/crawler/AQI/site`
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

## 13 查詢使用者的自訂值
### 方式
- HTTP Request: GET
  * Params
- URL: `/read/UserCustomValueStatus`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想查詢的部分
  * 可查詢的部分
     |    Value    |            功能            |
     |:-----------:|:--------------------------:|
     | `username`  |         使用者帳戶         |
     | `ValueName` | 指定查詢的使用者自訂值名稱 |
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
    |   Respose   |              表示              |
    |:-----------:|:------------------------------:|
    |    code     |          1(成功回傳)           |
    |  username   |           使用者帳戶           |
    | [ValueName] | 輸出指定查詢後使用者的自訂數值 |

## 14 查詢當下使用者的自訂值的記錄&時間
### 方式
- HTTP Request: GET
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/read/UserCustomValueRec`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想查詢的部分
  * 可查詢的部分
     |    Value    |            功能            |
     |:-----------:|:--------------------------:|
     | `username`  |         使用者帳戶         |
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
    |   Respose   |              表示              |
    |:-----------:|:------------------------------:|
    |    code     |          1(成功回傳)           |
    |  username   |           使用者帳戶           |
    | [ValueName] | 輸出指定查詢後使用者的自訂數值 |
    |    date     |            記錄日期            |
    |    time     |            記錄時間            |

## 15 使用者更改方案
### 方式
- HTTP Request: Post
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/user/ModeChoose`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想更改的部分
  * 可更改的部分
     |   Value    |    功能    |
     |:----------:|:----------:|
     | `username` | 使用者帳戶 |
     |   `Mode`   | 使用者方案 |
### 輸出
- 功能: 檢查是否成功修改
- 格式: JSON
- 動作: 成功回傳時,則回應
  |   Respose    | 表示方式 |
  |:------------:|:--------:|
  | 回傳相關資料 |   成功   |
  |     `0`      |   失敗   |
  |     `-1`     |   錯誤   |
- 成功回傳時，則回應對應的請求
  * API Request
    |   Respose   |              表示              |
    |:-----------:|:------------------------------:|
    |    code     |          1(成功回傳)           |

## 16 查詢使用者的方案
### 方式
- HTTP Request: GET
  * Params
- URL: `/users/Modeview`
### 輸入
- 格式: 字串
- 僅送出請求
### 輸出
- 功能: 檢查使用者是否存在資料庫且比對傳送過來的資料是否一致
- 格式: JSON
- 動作:
    * 成功回傳時,則回應
      |   Respose    | 表示方式 |
      |:------------:|:--------:|
      | 回傳相關資料 |   成功   |
      |     `0`      |   失敗   |
      |     `-1`     |   錯誤   |
    * 成功回傳時，則回應對應的請求
      * API Request
        | Respose  |    說明    |
        |:--------:|:----------:|
        | username | 使用者名稱 |
        |   Mode   |  選定方案  |

## 17 管理者登入
### 方式
- HTTP Request: POST
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/auth/MasterLogin`
### 輸入
- 動作: 把需要核對的使用者資料送出
  * Body String Value
    |  送出變數  |    功能    |
    |:----------:|:----------:|
    | `username` | 使用者帳戶 |
    | `password` |    密碼    |
### 輸出
- 功能: 檢查使用者是否存在資料庫且比對傳送過來的資料是否一致
  * 限定只有管理者進行登入
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

## 18 WebHook Endpoint
### 方式
- HTTP Request: POST
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/webhook`
### 輸入
- 動作: 把需要核對的使用者資料送出
  * Body String Value
### 輸出
- 功能: 連線成功
  * Http Status Code: 200

## 19 計算交通碳足跡(手動填入)
### 方式
- HTTP Request: Post
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/cal/Cfoot/traffic`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想更改的部分
  * 可更改的部分
     | Value  |    功能    |
     |:------:|:----------:|
     | `CPL`  |  排放因數  |
     | `dist` | 旅行的距離 |

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
    |  Respose   |      表示      |
    |:----------:|:--------------:|
    |    code    |  1(成功回傳)   |
    |   output   | 計算結果(數值+單位) |
    | output_num | 計算結果(數值) |
    |  use_unit  |   使用的單位   |

## 20 計算交通碳足跡(自動填入)
### 方式
- HTTP Request: Post
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/cal/Cfoot/traffic_db`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想更改的部分
  * 可更改的部分
     | Value  |    功能    |
     |:------:|:----------:|
     | `CPL`  |    物件    |
     | `dist` | 旅行的距離 |

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
    |  Respose   |      表示      |
    |:----------:|:--------------:|
    |    code    |  1(成功回傳)   |
    |   output   | 計算結果(數值+單位) |
    | output_num | 計算結果(數值) |
    |  use_unit  |   使用的單位   |

## 21 計算其它碳足跡(手動填入)
### 方式
- HTTP Request: Post
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/cal/Cfoot/other`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想更改的部分
  * 可更改的部分
     | Value  |    功能    |
     |:------:|:----------:|
     | `CPL`  |  排放因數  |
     | `dist` | 旅行的距離 |

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
    |  Respose   |      表示      |
    |:----------:|:--------------:|
    |    code    |  1(成功回傳)   |
    |   output   | 計算結果(數值+單位) |
    | output_num | 計算結果(數值) |
    |  use_unit  |   使用的單位   |

## 22 計算其它碳足跡(自動填入)
### 方式
- HTTP Request: Post
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/cal/Cfoot/other_db`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想更改的部分
  * 可更改的部分
     | Value  |    功能    |
     |:------:|:----------:|
     | `CPL`  |    物件    |
     | `dist` | 旅行的距離 |

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
    |  Respose   |      表示      |
    |:----------:|:--------------:|
    |    code    |  1(成功回傳)   |
    |   output   | 計算結果(數值+單位) |
    | output_num | 計算結果(數值) |
    |  use_unit  |   使用的單位   |

## 23 排放量(手動填入)
### 方式
- HTTP Request: Post
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/cal/CBAM/emissions`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想更改的部分
  * 可更改的部分
     | Value |   功能   |
     |:-----:|:--------:|
     | `use` |  使用量  |
     | `GWP` | 排放因數 |
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
    |  Respose   |      表示      |
    |:----------:|:--------------:|
    |    code    |  1(成功回傳)   |
    |   output   | 計算結果(數值+單位) |
    | output_num | 計算結果(數值) |
    |  use_unit  |   使用的單位   |

## 24 排放量(自動填入)
### 方式
- HTTP Request: Post
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/cal/CBAM/emissions_db`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想更改的部分
  * 可更改的部分
     | Value |   功能   |
     |:-----:|:--------:|
     | `use` |  使用量  |
     | `GWP` | 排放因數 |
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
    |  Respose   |      表示      |
    |:----------:|:--------------:|
    |    code    |  1(成功回傳)   |
    |   output   | 計算結果(數值+單位) |
    | output_num | 計算結果(數值) |
    |  use_unit  |   使用的單位   |

## 25 碳含量_簡單與中間產品(手動填入)
### 方式
- HTTP Request: Post
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/cal/CBAM/CC_simple`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想更改的部分
  * 可更改的部分
     |    Value     |         功能         |
     |:------------:|:--------------------:|
     | `emissions`  |        排放量        |
     | `production` | 產品活動數據(生產量) |
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
    |  Respose   |      表示      |
    |:----------:|:--------------:|
    |    code    |  1(成功回傳)   |
    |   output   | 計算結果(數值+單位) |
    | output_num | 計算結果(數值) |
    |  use_unit  |   使用的單位   |

## 26 碳含量_簡單與中間產品(自動填入)
### 方式
- HTTP Request: Post
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/cal/CBAM/CC_simple_db`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想更改的部分
  * 可更改的部分
     |    Value     |         功能         |
     |:------------:|:--------------------:|
     |    `use`     |        使用量        |
     |    `GWP`     |       排放因數       |
     | `production` | 產品活動數據(生產量) |
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
    |  Respose   |      表示      |
    |:----------:|:--------------:|
    |    code    |  1(成功回傳)   |
    |   output   | 計算結果(數值+單位) |
    | output_num | 計算結果(數值) |
    |  use_unit  |   使用的單位   |

## 27 碳含量_複雜產品(手動填入)
### 方式
- HTTP Request: Post
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/cal/CBAM/CC_simple`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想更改的部分
  * 可更改的部分
     |      Value       |         功能         |
     |:----------------:|:--------------------:|
     |   `emissions`    |        排放量        |
     |   `production`   | 產品活動數據(生產量) |
     | `Mid_production` |   中間產品活動數據   |
     |       `CC`       |    中間產品碳含量    |

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
    |  Respose   |      表示      |
    |:----------:|:--------------:|
    |    code    |  1(成功回傳)   |
    |   output   | 計算結果(數值+單位) |
    | output_num | 計算結果(數值) |
    |  use_unit  |   使用的單位   |

## 28 查詢全部物品的碳排放資料
### 方式
- HTTP Request: Post
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/cal/CBAM/CC_simple`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想更改的部分
  * 可更改的部分
     |      Value       |         功能         |
     |:----------------:|:--------------------:|
     |   `emissions`    |        排放量        |
     |   `production`   | 產品活動數據(生產量) |
     | `Mid_production` |   中間產品活動數據   |
     |       `CC`       |    中間產品碳含量    |

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
    |  Respose   |      表示      |
    |:----------:|:--------------:|
    |    code    |  1(成功回傳)   |
    |   output   | 計算結果(數值+單位) |
    | output_num | 計算結果(數值) |
    |  use_unit  |   使用的單位   |

## 29 查詢所有物品的碳排放資料
### 方式
- HTTP Request: GET
  * Params
- URL: `/read/crawler/CFoot/ALL`
### 輸入
- 格式: 字串
- 僅送出請求
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
    |     Respose      |             表示              |
    |:----------------:|:-----------------------------:|
    |       code       |          1(成功回傳)          |
    |        id        |             筆數              |
    |       name       |           係數名稱            |
    |       coe        |      碳足跡數值(kgCO2e)       |
    |       unit       |           宣告單位            |
    |  departmentname  | 政府部門/公司名稱(選擇性揭露) |
    | announcementyear |           公告年份            |

## 30 查詢指定物品的碳排放資料
### 方式
- HTTP Request: GET
  * body
  * MIME type: `application/x-www-form-urlencoded`
- URL: `/read/crawler/Cfoot/name`
### 輸入
- 格式: 字串
- 動作: 送出請求+欲想傳送的㯗位
  * 可查詢的部分
    | Value |    功能    |
    |:-----:|:----------:|
    | name  | 指定的物品 |
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
    |     Respose      |             表示              |
    |:----------------:|:-----------------------------:|
    |       code       |          1(成功回傳)          |
    |        id        |             筆數              |
    |       name       |           係數名稱            |
    |       coe        |      碳足跡數值(kgCO2e)       |
    |       unit       |           宣告單位            |
    |  departmentname  | 政府部門/公司名稱(選擇性揭露) |
    | announcementyear |           公告年份            |

## 31 查詢全部物品名
### 方式
- HTTP Request: GET
  * Params
- URL: `/read/crawler/CFoot/list`
### 輸入
- 格式: 字串
- 僅送出請求

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
    | Respose |    表示     |
    |:-------:|:-----------:|
    |  code   | 1(成功回傳) |
    |   id    |    筆數     |
    |  name   |  係數名稱   |
