# 序列埠傳輸
## 運行過程
當該程序己啟動時，則會從序列埠讀取Arduino Uno所輸出的資料且會每6秒自動傳送相關資料給後端。

## 啟動方式
- 主體: `npm start`
- 伺服器連線測試: `npm run server_test`
- 輸出二進制檔
  * Windows: `npm run build_win`
    * 支援平台: X86-64,ARM(64)
  * Linux: `npm run build_linux`
    * 支援平台: X86-64,ARM(64)

## 相關設置
- 設置檔存放點: `/config`
  * 時間: `clockSet.cfg`
  * 裝置&通訊協定: `device.cfg` 
    * Linux: `/dev/tty*`
    * Windwos: `COMX` 