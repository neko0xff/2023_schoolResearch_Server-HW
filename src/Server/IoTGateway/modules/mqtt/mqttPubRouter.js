/* eslint-disable no-unused-vars */
/*相関函式庫*/
var mqttClient=require("./mqttClient.js");
var database=require("../database.js");
var clock=require("../clock.js");

/*Pub Client*/
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

async function pubSensor(device_ID,sensor){
    var readSQL = `SELECT ${sensor},date,time FROM ${device_ID}_Table ORDER BY date DESC, time DESC LIMIT 1;`;
    var topicPub = `/${device_ID}/${sensor}`;
    this.pubRouter(topicPub,readSQL);
}

async function pubSwitch(device_ID,switchname){
    var readSQL = `SELECT name,status FROM ${device_ID}_Status WHERE name= '${switchname}';`;
    var topicPub = `/${device_ID}/${switchname}`;
    pubRouterSwitch(topicPub,readSQL);
}

async function pubCustomValue(username){
    var readSQL = `SELECT customvar01,customvar02,customvar03,customvar04,customvar05,customvar06,customvar07 FROM Users WHERE username= '${username}'; `;
    var topicPub = `/Users/${username}/CustomValue`;
    pubRouterSwitch(topicPub,readSQL);
}

/*查詢使用者的自訂值且比對*/
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
    this.pubRouter(topicPub,readSQL);
}

function pubSwitchALL(device_ID){
   this.pubSwitch(device_ID,"fan1");
   this.pubSwitch(device_ID,"fan2"); 
}

function pubSensorALL(device_ID){
    this.pubSensor(device_ID,"hum");
    this.pubSensor(device_ID,"temp");
    this.pubSensor(device_ID,"tvoc");
    this.pubSensor(device_ID,"pm25");
    this.pubSensor(device_ID,"co");
    this.pubSensor(device_ID,"co2");
    this.pubSensor(device_ID,"o3");
}

async function pubUsersComparisonResultALL() {
    const cnDB = database.cnDB(); 

    try {
        /*讀取使用者列表*/
        const connection = await cnDB.getConnection();
        const listSQL = "SELECT username FROM Users";
        const [results] = await connection.execute(listSQL); 

        for (const item of results) {
            const username = item.username;
            await this.pubUsersComparisonResult(username);
        }

        connection.release();
    } catch(error) {
        console.error(`Error: ${error}`);
    }
}

async function pubCustomValueALL() {
    const cnDB = database.cnDB(); 

    try {
        /*讀取使用者列表*/
        const connection = await cnDB.getConnection();
        const listSQL = "SELECT username FROM Users";
        const [results] = await connection.execute(listSQL); 

        for (const item of results) {
            const username = item.username;
            await this.pubCustomValue(username);
        }

        connection.release();
    } catch(error) {
        console.error(`Error: ${error}`);
    }
}


module.exports={
    pubRouter:pubRouter,
    pubSensor:pubSensor,
    pubSwitch:pubSwitch,
    pubUsersComparisonResult:pubUsersComparisonResult,
    pubCustomValue:pubCustomValue,
    pubSensorALL:pubSensorALL,
    pubSwitchALL:pubSwitchALL,
    pubUsersComparisonResultALL:pubUsersComparisonResultALL,
    pubCustomValueALL:pubCustomValueALL
};

