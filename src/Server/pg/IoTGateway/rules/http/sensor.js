/* 相関函式庫 */
const mqttPubUser = require("../mqtt/Pubuser.js");
const mqttPubsensor = require("../mqtt/Pubsensor.js");
const xss = require("xss");
const clock = require("../../modules/clock.js");
const httpServer = require("../../modules/httpServer.js");
const database = require("../../modules/database.js");
const strcvlib = require("../../modules/str.js");
const error = require("../../modules/error.js");
const catchError = error.catchError;
var errorController = error.errorController;

/* 資料庫&後端 */
const app = httpServer.app();

/*開發版上傳專用*/

// POST /upload/:deviceID/data =>  開發版上傳
// 接收格式：x-www-form-urlencoded
app.post("/upload/:deviceID/data", async function(req, res) {
    var device_ID = xss(req.params.deviceID);
    const { hum = 0, temp = 0, tvoc = 0, co = 0, co2 = 0, pm25 = 0, o3 = 0 } = req.body;
    var deviceNamecv = strcvlib.firstLetterToLower(device_ID); 
    var date = clock.SQLDate();
    var time = clock.SQLTime();
    const cnDB = database.cnDB();
    const connection = await cnDB.connect();
    var sql = `
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
app.get("/read/StatusGet/:deviceID/powerStatus", catchError(async function (req, res) {
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
app.get("/read/:deviceID/ALL", async function(req, res) {
    var device_ID = xss(req.params.deviceID);
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    var readSQL = `
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
app.get("/read/:deviceID/hum", async function(req, res) {
    var device_ID = xss(req.params.deviceID);
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    var readSQL = `
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
app.get("/read/:deviceID/temp", async function(req, res) {
    var device_ID = xss(req.params.deviceID);
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    var readSQL = `
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
app.get("/read/:deviceID/tvoc",async function(req, res){
    var device_ID=xss(req.params.deviceID);
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    var readSQL = `
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
app.get("/read/:deviceID/co2",async function(req, res){
      var device_ID=xss(req.params.deviceID);
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    var readSQL = `
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
app.get("/read/:deviceID/co",async function(req, res){
    var device_ID=xss(req.params.deviceID);
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    var readSQL = `
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
app.get("/read/:deviceID/pm25",async function(req, res){
    var device_ID=xss(req.params.deviceID);
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    var readSQL = `
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
app.get("/read/:deviceID/o3",async function(req, res){
    var device_ID=xss(req.params.deviceID);
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    var readSQL = `
        SELECT o3, date, time 
        FROM sensordb.${deviceNamecv}_table 
        ORDER BY date DESC, time DESC
        LIMIT 8;
    `;
    
    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/o3`);
    database.handleDatabaseQuery(req, res,readSQL);
},catchError(errorController));