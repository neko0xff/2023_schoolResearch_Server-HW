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

module.exports={
    pubRouter:pubRouter,
    pubSensor:pubSensor,
    pubSwitch:pubSwitch,
    pubSensorALL:pubSensorALL,
    pubSwitchALL:pubSwitchALL,
};

