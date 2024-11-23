/* eslint-disable no-unused-vars */
/*相関函式庫*/
var mqttClient=require("./mqttClient.js");
var database=require("../database.js");
var clock=require("../clock.js");

async function pubRouter(Pubtopic,SQL){
    console.log(`[${clock.consoleTime()}] MQTT Pub= ${Pubtopic}`);
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    try{
        const [results, fields] = await connection.execute(SQL); // 執行 SQL 查詢
        // 將日期格式化為 "yyyy-mm-dd"
        const formattedResults = results.map(item => ({
            ...item,
            date: item.date ? clock.formatDateToYYYYMMDD(item.date) : null
        }));
        var data = JSON.stringify(formattedResults);
        mqttClient.Pub(Pubtopic,data,5000);
        console.log(`[${clock.consoleTime()}] Pub Data= ${data}` );
    }catch(error){
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        mqttClient.Pub(Pubtopic,"Not Connect",5000);
        throw error;
    }finally{
        connection.release(); // 釋放連接
    }
}

async function pubRouterSwitch(Pubtopic,SQL){
    console.log(`[${clock.consoleTime()}] MQTT Pub= ${Pubtopic}`);
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    try{
        const [results, fields] = await connection.execute(SQL); // 執行 SQL 查詢
        var data = JSON.stringify(results);
        mqttClient.Pub(Pubtopic,data,5000);
        console.log(`[${clock.consoleTime()}] Pub Data= ${data}` );
    }catch(error){
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        mqttClient.Pub(Pubtopic,"Not Connect",5000);
        throw error;
    }finally{
        connection.release(); // 釋放連接
    }
}

async function processListFromDatabase(listSQL, processFunction) {
    const cnDB = database.cnDB(); 

    try {
        const connection = await cnDB.getConnection();
        const [results] = await connection.execute(listSQL); 

        // 使用 Promise.all 以並行的方式處理列表中的每個項目
        await Promise.all(results.map(async (item) => {
            await processFunction(item);
        }));

        await connection.release(); // 釋放連接
    } catch(error) {
        console.error(`Error: ${error}`);
    }
}

async function pubUsersComparisonResultALL() {
    const listSQL = "SELECT username FROM Users";
    await processListFromDatabase(listSQL, async (item) => {
        const username = item.username;
        await pubUsersComparisonResult(username);
    });
}

async function pubCustomValueALL() {
    const listSQL = "SELECT username FROM Users";
    await processListFromDatabase(listSQL, async (item) => {
        const username = item.username;
        await pubCustomValue(username);
    });
}

async function pubCrawlerAQIALL() {
    const listSQL = "SELECT sitename FROM AQX_P_434";
    await processListFromDatabase(listSQL, async (item) => {
        const sitename = item.sitename;
        await pubCrawlerAQI(sitename);
    });
}

async function pubSensor(device_ID,sensor){
    var readSQL = `SELECT ${sensor},date,time FROM ${device_ID}_Table ORDER BY date DESC, time DESC LIMIT 1;`;
    var topicPub = `/Device/${device_ID}/${sensor}`;
    pubRouter(topicPub,readSQL);
}

async function pubSwitch(device_ID,switchname){
    var readSQL = `SELECT name,status FROM ${device_ID}_Status WHERE name= '${switchname}';`;
    var topicPub = `/Device/${device_ID}/${switchname}`;
    pubRouterSwitch(topicPub,readSQL);
}

async function pubCustomValue(username){
    var readSQL = `SELECT customvar01,customvar02,customvar03,customvar04,customvar05,customvar06,customvar07 FROM Users WHERE username= '${username}'; `;
    var topicPub = `/Users/${username}/CustomValue`;
    pubRouterSwitch(topicPub,readSQL);
}

async function pubCrawlerAQI(sitename){
    var readSQL = `SELECT siteid,sitename,aqi,monitordate FROM AQX_P_434 WHERE sitename = "${sitename}" ORDER BY siteid ASC;`;
    var topicPub = `/Crawler/AQI/${sitename}`;
    pubRouterSwitch(topicPub,readSQL);
}

async function pubUsersComparisonResult(username){
    var readSQL = `
        SELECT
            CASE WHEN Sensor01_Table.hum > Users.customvar01 THEN 1 ELSE 0 END AS comparison_result_hum,
            CASE WHEN Sensor01_Table.temp > Users.customvar02 THEN 1 ELSE 0 END AS comparison_result_temp,
            CASE WHEN Sensor01_Table.tvoc > Users.customvar03 THEN 1 ELSE 0 END AS comparison_result_tvoc,
            CASE WHEN Sensor01_Table.co > Users.customvar04 THEN 1 ELSE 0 END AS comparison_result_co,
            CASE WHEN Sensor01_Table.co2 > Users.customvar05 THEN 1 ELSE 0 END AS comparison_result_co2,
            CASE WHEN Sensor01_Table.pm25 > Users.customvar06 THEN 1 ELSE 0 END AS comparison_result_pm25,
            CASE WHEN Sensor01_Table.o3 > Users.customvar07 THEN 1 ELSE 0 END AS comparison_result_o3
        FROM
            Sensor01_Table
        CROSS JOIN
            Users
        WHERE 
            Users.username = '${username}'
        ORDER BY
            Sensor01_Table.date DESC,
            Sensor01_Table.time DESC
        LIMIT 1;
    `;
    var topicPub = `/Users/${username}/comparison_result`;
    pubRouter(topicPub,readSQL);
}

function pubSwitchALL(device_ID){
   pubSwitch(device_ID,"fan1");
   pubSwitch(device_ID,"fan2"); 
}

function pubSensorALL(device_ID){
    pubSensor(device_ID,"hum");
    pubSensor(device_ID,"temp");
    pubSensor(device_ID,"tvoc");
    pubSensor(device_ID,"pm25");
    pubSensor(device_ID,"co");
    pubSensor(device_ID,"co2");
    pubSensor(device_ID,"o3");
}

module.exports={
    pubRouter:pubRouter,
    pubSensor:pubSensor,
    pubSwitch:pubSwitch,
    pubUsersComparisonResult:pubUsersComparisonResult,
    pubCustomValue:pubCustomValue,
    pubCrawlerAQI:pubCrawlerAQI,
    pubSensorALL:pubSensorALL,
    pubSwitchALL:pubSwitchALL,
    pubUsersComparisonResultALL:pubUsersComparisonResultALL,
    pubCustomValueALL:pubCustomValueALL,
    pubCrawlerAQIALL:pubCrawlerAQIALL
};
