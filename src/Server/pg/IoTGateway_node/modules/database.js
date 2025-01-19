var clock = require("./clock.js");
var { Pool } = require("pg");
var ConfigParser = require("configparser");

/* 配置檔案讀取 */
const configDB = new ConfigParser();
configDB.read("./modules/config/cnSet.cfg");

/* 資料庫連接設置 */
var setDB = new Pool({
    host: configDB.get("POSTGRESQL", "DBsource"),
    user: configDB.get("POSTGRESQL", "DBuser"),
    password: configDB.get("POSTGRESQL", "DBpassword"),
    port: configDB.get("POSTGRESQL", "DBport"),
    database: configDB.get("POSTGRESQL", "cnDatabase"),
    max: 200, // 最大連線數
    connectionTimeoutMillis: 20000,     // 連接超時時間 = 20sec
    idleTimeoutMillis: 30000,                      // 閒置超時時間 =30sec
});

/*主程式*/

function cnDB() {
    return setDB; 
}

function escape(VALUES) {
    return VALUES; 
}

// 執行查詢並回傳結果
async function executeQuery(query, params = []) {
    const connection = await cnDB().connect(); 
    //console.log(`[${clock.consoleTime()}] Executing query: ${query} with params: ${JSON.stringify(params)}`);
    
    try {
        const queryResult = await connection.query(query, params);

        if (!queryResult || !queryResult.rows) {
            throw new Error('Query did not return valid results.');
        }

        return queryResult.rows; 
    } catch (err) {
        console.error(`[${clock.consoleTime()}] Query Error: ${err.message}`);
        console.log(`Executing query: ${query} with params: ${JSON.stringify(params)}`);
        throw err; 
    } finally {
        connection.release(); 
    }
}

// 查詢資料庫並將結果發送回應
async function queryDatabaseAndSendResponse(res, sql, params = []) {
    try {
        const results = await executeQuery(sql, params);

        if (!results || results.length === 0) {
            res.status(404).send({ code: "-1", message: "No data found" });
            return;
        }

        const formattedResults = results.map(item => ({
            code: "1",
            ...item,
            monitordate: item.monitordate ? clock.formatDateToYYYYMMDD(item.monitordate) : undefined
        }));
        
        res.status(200).send(JSON.stringify(formattedResults)); 
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        res.status(500).send({ code: "-1", message: error.message });
    }
}

// 處理資料庫查詢
async function handleDatabaseQuery(req, res, sql, params = []) {
    const results = await executeQuery(sql, params);
    //console.log(`[${clock.consoleTime()}] Executing query: ${sql} with params: ${JSON.stringify(params)}`);

    try {
        if (!results || results.length === 0) {
            const responseMeta = {
                code: "-1", 
                message: "No data found"
            };

            res.status(404).send(responseMeta); 
        } else {
            const formattedResults = results.map(item => ({
                code: "1", 
                ...item,
                monitordate: item.monitordate ? clock.formatDateToYYYYMMDD(item.monitordate) : undefined
            }));
    
            res.status(200).json(formattedResults); 
        }

    } catch (error) {
        const responseMeta = {
            code: "-1", 
            message: error.message || "An error occurred while executing the query"
        };

        console.error(`[${clock.consoleTime()}] Failed to execute query: ${sql}`);
        console.error(`[${clock.consoleTime()}] Error: ${error.message}`);
        res.status(500).send(responseMeta); 
    }
}

module.exports = {
    cnDB: cnDB,
    escape: escape,
    executeQuery: executeQuery,
    queryDatabaseAndSendResponse: queryDatabaseAndSendResponse,
    handleDatabaseQuery: handleDatabaseQuery
};
