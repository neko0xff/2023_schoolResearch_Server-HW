/*相關函式庫*/
const axios = require('axios');
const clock = require('./clock.js');
const database = require('./database.js');
var ConfigParser = require("configparser");
const configKEY = new ConfigParser();

configKEY.read("./module/config/cnSet.cfg");
configKEY.sections();

/*抓取來源: 行政院環境保護部(署)資料開放平臺*/
const key = configKEY.get("Opendata_APIKEY","moenv");
const server2 = 'data.moenv.gov.tw/api/v2/'; // 20230822 轉換
const url = `https://${server2}/cfp_p_02?api_key=${key}&limit=1000&sort=ImportDate%20desc&format=JSON`;

/*抓取函式*/
function getData() {
  console.log(`[${clock.consoleTime()}] web crawling cfp_p_02 ...`);
  axios.get(url)
    .then(async response => {
      const cnDB = database.cnDB();
      const connection = await cnDB.getConnection(); // 使用 await 等待取得連接
      //const yesterday = clock.yasterDate();
      
      /*資料開始抓取*/
      const responseData = response.data;
      const records = responseData.records;
      const filteredData = records
        // 輸出資料部分
        .map(item => ({
          name: item.name, //係數名稱
          coe: item.coe, //Co2e
          unit: item.unit, //宣告單位
          departmentname: item.departmentname, //政府部門/公司名稱（選擇性揭露） 
          announcementyear: item.announcementyear, //公告年份 
        }))

      /*把得到的資料上傳到資料庫*/
      for (const item of filteredData) {
         const sql_old = `
              INSERT INTO CFP_P_02 (name, coe, unit, departmentname, announcementyear )
              VALUES (?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
              name = VALUES(name), coe = VALUES(coe), unit = VALUES(unit), departmentname = VALUES(departmentname), announcementyear = VALUES(announcementyear)
         `;
         const sql=`
              INSERT INTO CFP_P_02 (name, coe, unit, departmentname, announcementyear)
              VALUES (?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
              name = VALUES(name), 
              coe = VALUES(coe),
              unit = VALUES(unit),
              departmentname = VALUES(departmentname),
              announcementyear = VALUES(announcementyear);
         `;
         const values = [item.name, item.coe, item.unit, item.departmentname, item.announcementyear ];
         await connection.query(sql, values);
      }

      connection.release();
      console.log(`[${clock.consoleTime()}] Now List data in Console...`);
      console.log(filteredData);
      console.log(`[${clock.consoleTime()}] web crawling cfp_p_02 END! `);
      return filteredData; 
    })
    .catch(error => {
      console.error(error);
    });
}

module.exports = {
  getData: getData,
};
