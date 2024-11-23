/* eslint-disable no-unused-vars */
/*相関函式庫*/
var mqttClient=require("./mqttClient.js");
var database=require("../database.js");
var clock=require("../clock.js");
var strcvlib=require("../str.js");

async function pubRouter(Pubtopic,SQL){
    console.log(`[${clock.consoleTime()}] MQTT Pub= ${Pubtopic}`);
    var cnDB=database.cnDB();
    const connection = await cnDB.connect();

    try{
        const [results, fields] = await connection.execute(SQL); 
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
        connection.release(); 
    }
}

async function pubRouterSwitch(Pubtopic,SQL){
    console.log(`[${clock.consoleTime()}] MQTT Pub= ${Pubtopic}`);
    var cnDB=database.cnDB();
    const connection = await cnDB.connect();  

    try{
        const {results, fields} = await connection.query(SQL);
        var data = JSON.stringify(results);
        mqttClient.Pub(Pubtopic,data,5000);
        console.log(`[${clock.consoleTime()}] Pub Data= ${data}` );
    }catch(error){
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        mqttClient.Pub(Pubtopic,"Not Connect",5000);
        throw error;
    }finally{
        connection.release(); 
    }
}

async function processListFromDatabase(listSQL, processFunction) {
    const cnDB = database.cnDB(); 

    try {
        const connection = await cnDB.connect();  
        const [results] = await connection.query(listSQL); 

        await Promise.all(results.map(async (item) => {
            await processFunction(item);
        }));

        await connection.release(); 
    } catch(error) {
        console.error(`Error: ${error}`);
    }
}

async function pubUsersComparisonResultALL() {
    const listSQL = "SELECT username FROM sensordb.users";
    await processListFromDatabase(listSQL, async (item) => {
        const username = item.username;
        await pubUsersComparisonResult(username);
    });
}

async function pubCustomValueALL() {
    const listSQL = "SELECT username FROM sensordb.users";
    await processListFromDatabase(listSQL, async (item) => {
        const username = item.username;
        await pubCustomValue(username);
    });
}

async function pubCrawlerAQIALL() {
    const listSQL = "SELECT sitename FROM sensordb.aqx_p_434";
    await processListFromDatabase(listSQL, async (item) => {
        const sitename = item.sitename;
        await pubCrawlerAQI(sitename);
    });
}

async function pubSensor(device_ID,sensor){
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    var readSQL = `
            SELECT ${sensor},date,time 
            FROM ${deviceNamecv}_table 
            ORDER BY date DESC, time 
            DESC LIMIT 1;
    `;
    var topicPub = `/Device/${device_ID}/${sensor}`;
    pubRouter(topicPub,readSQL);
}

async function pubSwitch(device_ID,switchname){
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    var readSQL = `
            SELECT name,status 
            FROM ${deviceNamecv}_status 
            WHERE name= '${switchname}';
    `;
    var topicPub = `/Device/${device_ID}/${switchname}`;
    pubRouterSwitch(topicPub,readSQL);
}

async function pubCustomValue(username){
    var readSQL = `
            SELECT customvar01,customvar02,customvar03,customvar04,customvar05,customvar06,customvar07 
            FROM sensordb.users 
            WHERE username= '${username}'; 
    `;
    var topicPub = `/Users/${username}/CustomValue`;
    pubRouterSwitch(topicPub,readSQL);
}

async function pubCrawlerAQI(sitename){
    var readSQL = `
            SELECT siteid,sitename,aqi,monitordate 
            FROM sensordb.aqx_p_434 
            WHERE sitename = "${sitename}" 
            ORDER BY siteid ASC;
    `;
    var topicPub = `/Crawler/AQI/${sitename}`;
    pubRouterSwitch(topicPub,readSQL);
}

async function pubUsersComparisonResult(username){
    var readSQL = `
        SELECT
            CASE WHEN sensordb.sensor01_table.hum > sensordb.users.customvar01 THEN 1 ELSE 0 END AS comparison_result_hum,
            CASE WHEN sensordb.sensor01_table.temp >  sensordb.users.customvar02 THEN 1 ELSE 0 END AS comparison_result_temp,
            CASE WHEN sensordb.sensor01_table.tvoc >  sensordb.users.customvar03 THEN 1 ELSE 0 END AS comparison_result_tvoc,
            CASE WHEN sensordb.sensor01_table.co >  sensordb.users.customvar04 THEN 1 ELSE 0 END AS comparison_result_co,
            CASE WHEN sensordb.sensor01_table.co2 >  sensordb.users.customvar05 THEN 1 ELSE 0 END AS comparison_result_co2,
            CASE WHEN sensordb.sensor01_table.pm25 > sensordb.users.customvar06 THEN 1 ELSE 0 END AS comparison_result_pm25,
            CASE WHEN sensordb.sensor01_table.o3 >  sensordb.users.customvar07 THEN 1 ELSE 0 END AS comparison_result_o3
        FROM
            sensordb.sensor01_table
        CROSS JOIN
            sensordb.users
        WHERE 
            sensordb.users.username = '${username}'
        ORDER BY
            sensordb.sensor01_table.date DESC,
            sensordb.sensor01_table.time DESC
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
