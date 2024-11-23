/*相関函式庫*/
var mqttPubSwitch = require("../mqtt/Pubsensor.js");
var clock = require("../../modules/clock.js");
var httpServer = require("../../modules/httpServer.js");
var database = require("../../modules/database.js");
var xss = require("xss");
var error = require("../../modules/error.js");
var catchError = error.catchError;
var errorController = error.errorController;
var strcvlib = require("../../modules/str.js");

/*資料庫&後端*/
var app = httpServer.app();

/* 開關控制 */
//  GET /set/switchCtr/:deviceID/fan1 => 控制 fan1 
app.get("/set/switchCtr/:deviceID/fan1", async function (req, res) {
    const device_ID = xss(req.params.deviceID);
    var deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    const status = xss(req.query.status);
    const date = clock.SQLDate();
    const time = clock.SQLTime();
    const switchName = 'fan1';
    const updateSQL = `
        UPDATE sensordb.${deviceNamecv}_status 
        SET status = $1
        WHERE name = '${switchName}';
    `;
    const recSQL = `
        INSERT INTO sensordb.${deviceNamecv}_statusrec(switch, status, date, time) 
        VALUES ('${switchName}', $1, $2, $3);
    `;

    console.log(`[${clock.consoleTime()}] HTTP GET /set/switchCtr/${device_ID}/${switchName}`);
    try {
        const response = { status: status == 1 ? "On" : "Off" };

        await database.executeQuery(recSQL, [status, date, time]);
        await database.executeQuery(updateSQL, [status]);
        mqttPubSwitch.pubSwitch(device_ID, switchName);
        console.log(`[${clock.consoleTime()}] ${switchName} is ${response.status}`);
        res.send(response);

    } catch (err) {
        const responseMeta = { 
            code: "-1",
            error: err.message 
        };

        res.status(500).json(responseMeta);
    }
}, catchError(errorController));

//  GET /set/switchCtr/:deviceID/fan2 =>  控制 fan2
app.get("/set/switchCtr/:deviceID/fan2", async function (req, res) {
    const device_ID = xss(req.params.deviceID);
    var deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    const status = xss(req.query.status);
    const date = clock.SQLDate();
    const time = clock.SQLTime();
    const switchName = 'fan2';
    const updateSQL = `
        UPDATE sensordb.${deviceNamecv}_status 
        SET status = $1
        WHERE name = '${switchName}'
    `;
    const recSQL = `
        INSERT INTO sensordb.${deviceNamecv}_statusrec(switch, status, date, time) 
        VALUES ('${switchName}', $1, $2, $3)
    `;

    console.log(`[${clock.consoleTime()}] HTTP GET /set/switchCtr/${device_ID}/${switchName}`);
    try {
        const response = { status: status == 1 ? "On" : "Off" };
        await database.executeQuery(recSQL, [status, date, time]);
        await database.executeQuery(updateSQL, [status]);
        mqttPubSwitch.pubSwitch(device_ID, switchName);
        console.log(`[${clock.consoleTime()}] ${switchName} is ${response.status}`);
        res.send(response);
    } catch (err) {
        const responseMeta = { code: "-1", error: err.message };
        res.status(500).json(responseMeta);
    }
}, catchError(errorController));

// GET /read/statusRec/:deviceID/viewALL =>   檢視開關控制紀錄
app.get("/read/statusRec/:deviceID/viewALL", async function (req, res) {
    const device_ID = xss(req.params.deviceID);
    var deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    const sql = `
        SELECT rec01.switch, status01.status, rec01.date, rec01.time
        FROM (
                SELECT switch, status, date, time,
                    ROW_NUMBER() 
                    OVER(PARTITION BY switch ORDER BY date DESC, time DESC) 
                    AS rn
                FROM sensordb.${deviceNamecv}_statusrec
        ) AS latest
        JOIN sensordb.${deviceNamecv}_statusrec rec01
        ON latest.switch = rec01.switch AND latest.date = rec01.date AND latest.time = rec01.time
        JOIN sensordb.${deviceNamecv}_status status01 
        ON rec01.switch = status01.name
        WHERE latest.rn = 1;
    `;
        
    console.log(`[${clock.consoleTime()}] HTTP GET /read/statusRec/${device_ID}/viewALL`);
    database.handleDatabaseQuery(req, res, sql);
}, catchError(errorController));

// GET /read/statusNow/:deviceID/viewALL =>   檢視現在的開關控制狀態
app.get("/read/statusNow/:deviceID/viewALL", async function (req, res) {
    const device_ID = xss(req.params.deviceID);
    var deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    const sql = `
        SELECT name, status 
        FROM sensordb.${deviceNamecv}_status;
    `;
        
    console.log(`[${clock.consoleTime()}] HTTP GET /read/statusNow/${device_ID}/viewALL`);
    database.handleDatabaseQuery(req, res, sql);
}, catchError(errorController));