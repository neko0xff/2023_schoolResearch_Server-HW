/*相関函式庫*/
var mqttClient = require("./mqttClient.js");
var database = require("../database.js");
var clock = require("../clock.js");

/* 主程式 */
async function pubRouter(Pubtopic, SQL) {
    console.log(`[${clock.consoleTime()}] MQTT Pub= ${Pubtopic}`);
    var cnDB = database.cnDB();
    const connection = await cnDB.connect(); 
    
    try {
        const { rows, fields } = await connection.query(SQL);  
        const formattedResults = rows.map(item => ({
            ...item,
            date: item.date ? clock.formatDateToYYYYMMDD(item.date) : null
        }));

        var data = JSON.stringify(formattedResults);
        mqttClient.Pub(Pubtopic, data, 5000);
        // console.log(`[${clock.consoleTime()}] Pub Data= ${data}`);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        mqttClient.Pub(Pubtopic, "Not Connect", 10000);
        throw error;
    } finally {
        connection.release();
    }
}

async function pubRouter_hour(Pubtopic, SQL) {
    console.log(`[${clock.consoleTime()}] MQTT Pub= ${Pubtopic}`);
    var cnDB = database.cnDB();
    const connection = await cnDB.connect(); 
    
    try {
        const { rows, fields } = await connection.query(SQL);  
        const formattedResults = rows.map(item => ({
            ...item
        }));

        var data = JSON.stringify(formattedResults);
        mqttClient.Pub_hour(Pubtopic, data, 1);
        // console.log(`[${clock.consoleTime()}] Pub Data= ${data}`);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        mqttClient.Pub(Pubtopic, "Not Connect", 10000);
        throw error;
    } finally {
        connection.release();
    }
}

async function pubRouterSwitch(Pubtopic, SQL) {
    console.log(`[${clock.consoleTime()}] MQTT Pub= ${Pubtopic}`);
    var cnDB = database.cnDB();
    const connection = await cnDB.connect();  

    try {
        const { rows, fields } = await connection.query(SQL);  

        var data = JSON.stringify(rows); 
        mqttClient.Pub(Pubtopic, data, 10000);
        // console.log(`[${clock.consoleTime()}] Pub Data= ${data}`);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        mqttClient.Pub(Pubtopic, "Not Connect", 10000);
        throw error;
    } finally {
        connection.release();
    }
}

/* 處理資料庫資料表內容 */
async function processListFromDatabase(listSQL, processFunction) {
    var cnDB = database.cnDB();
    const connection = await cnDB.connect();  

    try {
        const res = await connection.query(listSQL); 
        const results = res.rows; 

        await Promise.all(results.map(async (item) => {
            try {
                await processFunction(item); 
            } catch (error) {
                console.error(`Error processing item: ${error}`);
            }
        }));
    } catch (error) {
        console.error(`Error: ${error}`);
    } finally {
        connection.release(); 
    }
}


module.exports = {
    pubRouter: pubRouter,
    pubRouter_hour: pubRouter_hour,
    pubRouterSwitch: pubRouterSwitch,
    processListFromDatabase: processListFromDatabase,
};
