/*相關函式庫*/
const axios = require('axios');
const clock = require('./clock.js');
const database = require('./database.js');

/*抓取來源: 行政院環境保護部(署)資料開放平臺*/
const key = 'e8dd42e6-9b8b-43f8-991e-b3dee723a52d';
const server2 = 'data.moenv.gov.tw/api/v2/'; // 20230822 轉換
const url = `https://${server2}/aqx_p_434?api_key=${key}&limit=1000&sort=ImportDate%20desc&format=JSON`;

/*抓取函式*/
function getData() {
  console.log(`[${clock.consoleTime()}] web crawling...`);
  axios.get(url)
    .then(async response => {
      const cnDB = database.cnDB();
      const connection = await cnDB.getConnection(); // 使用 await 等待取得連接
      const yesterday = clock.yasterDate();
      
      /*資料開始抓取*/
      const responseData = response.data;
      const records = responseData.records;
      const filteredData = records
        // 限定隔天的資料
        .filter(item => item.monitordate && item.monitordate.slice(0, 10) === yesterday)
        // 輸出資料部分
        .map(item => ({
          siteid: item.siteid, //測站編號
          sitename: item.sitename, //測站位置
          aqi: item.aqi, //aqi值
          monitordate: item.monitordate, //日期
        }))
        // 按照測站編號進行排序
        .sort((a, b) => a.siteid - b.siteid);

      /*把得到的資料上傳到資料庫*/
      for (const item of filteredData) {
         const sql = `
              INSERT INTO AQX_P_434 (siteid, sitename, aqi, monitordate)
              VALUES (?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
              siteid = VALUES(siteid), sitename = VALUES(sitename), aqi = VALUES(aqi), monitordate = VALUES(monitordate)
         `;
         const values = [item.siteid, item.sitename, item.aqi, item.monitordate];
         await connection.query(sql, values);
      }

      connection.release();
      console.log(`[${clock.consoleTime()}] Now List data in Console...`);
      console.log(filteredData);
      console.log(`[${clock.consoleTime()}] web crawling END! `);
      return filteredData; // 記得 return 處理後的資料
    })
    .catch(error => {
      console.error(error);
    });
}

module.exports = {
  getData: getData,
};
