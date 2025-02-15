/* 相関函式庫 */
import mqttPubUser from "../mqtt/Pubuser.js";
import  mqttPubsensor from "../mqtt/Pubsensor.js";
import xss from "xss";
import clock from "../../modules/clock.js";
import httpServer from "../../modules/httpServer.js";
import database from "../../modules/database.js";
import error from "../../modules/error.js";
import strcvlib from "../../modules/str.js";

/*錯誤處理*/
const catchError = error.catchError;
const errorController = error.errorController;

/* 資料庫&後端 */
const app = httpServer.app();

/*開發版上傳專用*/

// POST /upload/:deviceID/data =>  開發版上傳
// 接收格式：x-www-form-urlencoded
app.post("/upload/:deviceID/data", async function(req, res) {
    const device_ID = xss(req.params.deviceID);
    const { hum = 0, temp = 0, tvoc = 0, co = 0, co2 = 0, pm25 = 0, o3 = 0 } = req.body;
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID); 
    const date = clock.SQLDate();
    const time = clock.SQLTime();
    const cnDB = database.cnDB();
    const connection = await cnDB.connect();
    const sql = `
        INSERT INTO sensordb.${deviceNamecv}_table(hum, temp, tvoc, co, co2, pm25, o3, date, time) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    console.log(`[${clock.consoleTime()}] HTTP POST /upload/${device_ID}/data`);
    
    try {
        const responseMeta = { 
            code: "1",
            message: "Data uploaded successfully"
        };
        
        await database.executeQuery(sql, [hum, temp, tvoc, co, co2, pm25, o3, date, time]);
        mqttPubsensor.pubSensorALL(device_ID);
        mqttPubUser.pubUsersComparisonResultALL();
        console.log(`[${clock.consoleTime()}] Data uploaded successfully`);
        res.send(responseMeta);
    } catch (error) {
        const responseMeta = { 
            code: "-1",
            message: error.message
        };

        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        console.error(error.stack);
        res.status(500).json(responseMeta);
        throw error;
    } finally {
        connection.release();
    }

}, catchError(errorController));


// GET /read/StatusGet/:deviceID/powerStatus => 獲得電源狀態 
app.get("/read/StatusGet/:deviceID/powerStatus", catchError( function (req, res) {
    const device_ID = xss(req.params.deviceID);
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    const sql = `
        SELECT name, status 
        FROM sensordb.${deviceNamecv}_status;
    `;
    
    console.log(`[${clock.consoleTime()}] HTTP GET /read/StatusGet/${device_ID}/powerStatus`);
    database.handleDatabaseQuery(req, res, sql);
}),catchError(errorController));

/*讀值*/

// GET /read/:deviceID/ALL => 獲得'hum,temp,tvoc,co2,co,pm25,o3'資料
// 回傳格式: JSON
app.get("/read/:deviceID/ALL", function(req, res) {
    const device_ID = xss(req.params.deviceID);
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    const readSQL = `
        SELECT hum,temp,tvoc,co2,co,pm25,o3,date,time 
        FROM sensordb.${deviceNamecv}_table 
        ORDER BY date DESC, time DESC 
        LIMIT 1;
    `;

    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/ALL`);
    database.handleDatabaseQuery(req, res,readSQL);
});

// GET /read/:deviceID/hum => 獲得'hum'資料
// 回傳格式: JSON
app.get("/read/:deviceID/hum",  function(req, res) {
    const device_ID = xss(req.params.deviceID);
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    const readSQL = `
        SELECT hum, date, time 
        FROM sensordb.${deviceNamecv}_table 
        ORDER BY date DESC, time DESC
        LIMIT 8;
    `;

    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/hum`);
    database.handleDatabaseQuery(req, res,readSQL);
},catchError(errorController));

// GET /read/:deviceID/temp => 獲得'temp'資料
// 回傳格式: JSON
app.get("/read/:deviceID/temp",  function(req, res) {
    const device_ID = xss(req.params.deviceID);
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    const readSQL = `
            SELECT temp, date, time 
            FROM sensordb.${deviceNamecv}_table 
            ORDER BY date DESC, time DESC
            LIMIT 8;
    `;

    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/temp`);
    database.handleDatabaseQuery(req, res,readSQL);
},catchError(errorController));

// GET /read/:deviceID/tvoc => 獲得'tvoc'資料
// 回傳格式: JSON
app.get("/read/:deviceID/tvoc", function(req, res){
    const device_ID=xss(req.params.deviceID);
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    const readSQL = `
        SELECT tvoc, date, time 
        FROM sensordb.${deviceNamecv}_table 
        ORDER BY date DESC, time DESC
        LIMIT 8;
    `;

    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/tvoc`);
    database.handleDatabaseQuery(req, res,readSQL);
},catchError(errorController));

// GET /read/:deviceID/co2 => 獲得'co2'資料
// 回傳格式: JSON
app.get("/read/:deviceID/co2", function(req, res){
      const device_ID=xss(req.params.deviceID);
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    const readSQL = `
        SELECT co2, date, time 
        FROM sensordb.${deviceNamecv}_table 
        ORDER BY date DESC, time DESC
        LIMIT 8;
    `;
    
    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/co2`);
    database.handleDatabaseQuery(req, res,readSQL);
},catchError(errorController));

// GET /read/:deviceID/co => 獲得'co'資料
// 回傳格式: JSON
app.get("/read/:deviceID/co", function(req, res){
    const device_ID=xss(req.params.deviceID);
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    const readSQL = `
        SELECT co, date, time 
        FROM sensordb.${deviceNamecv}_table 
        ORDER BY date DESC, time DESC
        LIMIT 8;
    `;
    
    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/co`);
    database.handleDatabaseQuery(req, res,readSQL);
},catchError(errorController));

// GET /read/:deviceID/pm25 => 獲得'pm25'資料
// 回傳格式: JSON
app.get("/read/:deviceID/pm25", function(req, res){
    const device_ID=xss(req.params.deviceID);
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    const readSQL = `
        SELECT pm25, date, time 
        FROM sensordb.${deviceNamecv}_table 
        ORDER BY date DESC, time DESC
        LIMIT 8;
    `;
    
    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/pm25`);
    database.handleDatabaseQuery(req, res,readSQL);
},catchError(errorController));

// GET /read/:deviceID/o3 => 獲得'o3'資料
// 回傳格式: JSON
app.get("/read/:deviceID/o3", function(req, res){
    const device_ID=xss(req.params.deviceID);
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    const readSQL = `
        SELECT o3, date, time 
        FROM sensordb.${deviceNamecv}_table 
        ORDER BY date DESC, time DESC
        LIMIT 8;
    `;
    
    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/o3`);
    database.handleDatabaseQuery(req, res,readSQL);
},catchError(errorController));