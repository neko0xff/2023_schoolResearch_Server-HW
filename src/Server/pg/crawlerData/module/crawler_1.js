/* 相關函式庫 */
const axios = require('axios');
const clock = require('./clock.js');
const database = require('./database.js');
var ConfigParser = require("configparser");

/* 戴入配置檔 */
const configKEY = new ConfigParser();
configKEY.read("./module/config/cnSet.cfg");
configKEY.sections();

/* 抓取來源: 行政院環境保護部(署)資料開放平臺 */
const key = configKEY.get("Opendata_APIKEY", "moenv");
const server2 = 'data.moenv.gov.tw/api/v2/';
const url = `https://${server2}/aqx_p_434?api_key=${key}&limit=1000&sort=ImportDate%20desc&format=JSON`;

/* 抓取資料函式 */
async function getData() {
  console.log(`[${clock.consoleTime()}] web crawling aqx_p_434...`);

  try {
    const response = await axios.get(url);
    const cnDB = database.cnDB();
    const connection = await cnDB.connect();
    const yesterday = clock.yasterDate(); 
    const responseData = response.data;
    const records = responseData.records;
    const filteredData = records.filter(item => item.monitordate && item.monitordate.slice(0, 10) === yesterday) 
        .map(item => ({
          siteid: item.siteid, // 測站編號
          sitename: item.sitename, // 測站位置
          aqi: item.aqi, // AQI 值
          monitordate: item.monitordate, // 日期
        }))
        .sort((a, b) => a.siteid - b.siteid); // 根據測站編號排序
    const sql = `
        INSERT INTO sensordb.aqx_p_434 (siteid, sitename, aqi, monitordate)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (siteid) 
        DO UPDATE SET 
            sitename = EXCLUDED.sitename,
            aqi = EXCLUDED.aqi,
            monitordate = EXCLUDED.monitordate
      `;

    if (!records || records.length === 0) {
      console.log(`[${clock.consoleTime()}] No data found for ${yesterday}`);
      return [];  
    }

    for (const item of filteredData) {
        const values = [item.siteid, item.sitename, item.aqi, item.monitordate];
        try {
          await connection.query(sql, values); 
        } catch (err) {
          console.error(`[${clock.consoleTime()}] Failed to insert data for ${item.siteid}: ${err.message}`);
        } finally {

        }
    }

    connection.release();
    console.log(`[${clock.consoleTime()}] Now List data in Console...`);
    console.log(filteredData);
    console.log(`[${clock.consoleTime()}] web crawling aqx_p_434 END!`);
    return filteredData;
  } catch (error) {
    console.error(`[${clock.consoleTime()}] Error during API request or database operation: ${error.message}`);
  }
}

module.exports = {
  getData: getData,
};
