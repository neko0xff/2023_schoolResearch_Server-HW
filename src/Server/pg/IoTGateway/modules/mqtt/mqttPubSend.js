/*相関函式庫*/
import mqttClient from "./mqttClient.js";
import database from "../database.js";
import clock from "../clock.js";

/* 主程式 */

// 發布: 有變更或啟動時
// 回傳格式: JSON
async function pubRouter(Pubtopic, SQL,params) {
    const cnDB = database.cnDB();
    const connection = await cnDB.connect(); 
    
    console.log(`[${clock.consoleTime()}] MQTT Pub ${Pubtopic}`);
    try {
        const { rows, _fields } = await connection.query(SQL, params);  
        const formattedResults = rows.map(item => ({
            ...item,
            date: item.date ? clock.formatDateToYYYYMMDD(item.date) : null
        }));
        const data = JSON.stringify(formattedResults);

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

// 發布: 每小時一回
// 回傳格式: JSON
async function pubRouter_hour(Pubtopic, SQL,params) {
    const cnDB = database.cnDB();
    const connection = await cnDB.connect(); 
    
    console.log(`[${clock.consoleTime()}] MQTT Pub ${Pubtopic}`);
    try {
        const { rows, _fields } = await connection.query(SQL, params);  
        const formattedResults = rows.map(item => ({
            ...item
        }));
        const data = JSON.stringify(formattedResults);

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

// 發布: 開關狀態
// 回傳格式: JSON
async function pubRouterSwitch(Pubtopic, SQL,params) {
    const cnDB = database.cnDB();
    const connection = await cnDB.connect();  

    console.log(`[${clock.consoleTime()}] MQTT Pub ${Pubtopic}`);
    try {
        const { rows, _fields } = await connection.query(SQL, params);  
        const data = JSON.stringify(rows); 

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

// 處理資料庫中的資料表內容
async function processListFromDatabase(listSQL, processFunction) {
    const cnDB = database.cnDB();
    const connection = await cnDB.connect();  

    try {
        const res = await connection.query(listSQL); 
        const results = res.rows;
        
        if (!res || !res.rows) {
            console.error(`[${clock.consoleTime()}] No rows returned for query`);
            return;
        }

        if (results.length === 0) {
            console.log(`[${clock.consoleTime()}] No results found`);
            return;
        }

        await Promise.all(results.map(async (item) => {
            try {
                if (item) {
                    await processFunction(item); 
                } else {
                    console.error(`[${clock.consoleTime()}] Item is null or undefined`);
                }
            } catch (error) {
                console.error(`[${clock.consoleTime()}] Error processing item: ${error}`);
            }
        }));
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Error executing query: ${error}`);
    } finally {
        connection.release(); 
    }
}

const mqttPubSend = {
    pubRouter,
    pubRouter_hour,
    pubRouterSwitch,
    processListFromDatabase,
}

export default mqttPubSend;