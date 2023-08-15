const axios = require('axios');
const clock = require('./clock.js');
const database = require('./database.js');

const key = 'e8dd42e6-9b8b-43f8-991e-b3dee723a52d';
const url = 'https://data.epa.gov.tw/api/v2/aqx_p_434?api_key=' + key + '&limit=1000&sort=ImportDate%20desc&format=JSON';

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
        .filter(item => item.monitordate && item.monitordate.slice(0, 10) === yesterday)
        .map(item => ({
          siteid: item.siteid,
          sitename: item.sitename,
          aqi: item.aqi,
          monitordate: item.monitordate,
        }))
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
      console.log(filteredData);
      return filteredData; // 記得 return 處理後的資料
    })
    .catch(error => {
      console.error(error);
    });
}

module.exports = {
  getData: getData,
};
