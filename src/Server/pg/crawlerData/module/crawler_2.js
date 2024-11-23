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
const url = `https://${server2}/cfp_p_02?api_key=${key}&limit=1000&sort=ImportDate%20desc&format=JSON`;

/* 抓取函式 */
async function getData() {
  console.log(`[${clock.consoleTime()}] web crawling cfp_p_02...`);

  try {
    const response = await axios.get(url);
    const cnDB = database.cnDB();
    const connection = await cnDB.connect();
    const responseData = response.data;
    const records = responseData.records;

    if (!records || records.length === 0) {
      console.log(`[${clock.consoleTime()}] No data found.`);
      return []; 
    }

    const filteredData = records
      .map(item => ({
        name: item.name, // 係數名稱
        coe: item.coe, // Co2e
        unit: item.unit, // 宣告單位
        departmentname: item.departmentname, // 政府部門/公司名稱（選擇性揭露） 
        announcementyear: item.announcementyear, // 公告年份 
      }));

    // 資料庫插入操作
    for (const item of filteredData) {
      const sql = `
        INSERT INTO sensordb.cfp_p_02 (name, coe, unit, departmentname, announcementyear)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name) 
        DO UPDATE SET 
            coe = EXCLUDED.coe,
            unit = EXCLUDED.unit,
            departmentname = EXCLUDED.departmentname,
            announcementyear = EXCLUDED.announcementyear;
      `;
      const values = [item.name, item.coe, item.unit, item.departmentname, item.announcementyear];

      try {
        await connection.query(sql, values);
      } catch (err) {
        console.error(`[${clock.consoleTime()}] Failed to insert data for ${item.name}: ${err.message}`);
      }
    }

    connection.release();

    console.log(`[${clock.consoleTime()}] Now List data in Console...`);
    console.log(filteredData);
    console.log(`[${clock.consoleTime()}] web crawling cfp_p_02 END!`);
    
    return filteredData;
  } catch (error) {
    console.error(`[${clock.consoleTime()}] Error during API request or database operation: ${error.message}`);
  }
}

module.exports = {
  getData: getData,
};
