/* eslint-disable no-unused-vars */
/*相関函式庫*/
var mqttClient=require("./mqttClient.js");
var database=require("../database.js");
var clock=require("../clock.js");

async function pubRouter(Pubtopic,SQL){
    console.log(`[${clock.consoleTime()}] MQTT Pub= ${Pubtopic}`);
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); 
    
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
        mqttClient.Pub(Pubtopic,"Not Connect",10000);
        throw error;
    }finally{
        connection.release(); // 釋放連接
    }
}

async function pubRouter_hour(Pubtopic,SQL){
    console.log(`[${clock.consoleTime()}] MQTT Pub= ${Pubtopic}`);
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); 
    
    try{
        const [results, fields] = await connection.execute(SQL); // 執行 SQL 查詢
        // 將日期格式化為 "yyyy-mm-dd"
        const formattedResults = results.map(item => ({
            ...item
        }));
        var data = JSON.stringify(formattedResults);
        mqttClient.Pub_hour(Pubtopic,data,1);
        console.log(`[${clock.consoleTime()}] Pub Data= ${data}` );
    }catch(error){
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        mqttClient.Pub(Pubtopic,"Not Connect",10000);
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
        mqttClient.Pub(Pubtopic,data,10000);
        console.log(`[${clock.consoleTime()}] Pub Data= ${data}` );
    }catch(error){
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        mqttClient.Pub(Pubtopic,"Not Connect",10000);
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

        // 以並行的方式處理列表中的每個項目
        await Promise.all(results.map(async (item) => {
            await processFunction(item);
        }));

        await connection.release(); // 釋放連接
    } catch(error) {
        console.error(`Error: ${error}`);
    }
}

module.exports={
    pubRouter:pubRouter,
    pubRouter_hour:pubRouter_hour,
    pubRouterSwitch:pubRouterSwitch,
    processListFromDatabase: processListFromDatabase,
};
