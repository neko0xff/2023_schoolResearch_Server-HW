/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
/*相関函式庫*/
var clock=require("../modules/clock.js");
var httpServer=require("../modules/httpServer.js");
var database=require("../modules/database.js");
var error=require("../modules/error.js");
var catchError = error.catchError;
var errorController = error.errorController;

/*資料庫&後端*/
var cnDB=null;
var app=httpServer.app();

//POST /devices/serialnumber => 查詢序列號
//接收格式：x-www-form-urlencoded
app.post("/devices/serialnumber", async function(req, res) {
    const {device} = req.body;
    const searchSQL = `SELECT serialnumber FROM Devices WHERE device = '${device}'`;
  
    const cnDB = database.cnDB(); 
    const connection = await cnDB.getConnection();
  
    /*檢查使用者是否存在資料庫，若無則直接建立*/
    console.log(`[${clock.consoleTime()}] HTTP POST /devices/serialnumber`);
    try {  
        const [results] = await connection.execute(searchSQL);
        const serialnumber = await results[0].serialnumber;
        if (results.length !== 0) {
            connection.release();
            console.log(`[${clock.consoleTime()}] Data: ${device}=${serialnumber} `);
            const responseMeta = {
                code: "0",
                device: device,
                serialnumber: serialnumber
            };
            res.send(responseMeta);
        }
    } catch (error) {  
        console.log(`[${clock.consoleTime()}] Error`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    } finally {
        connection.release();
    }
},catchError(errorController));

//POST /devices/device => 查詢裝置
//接收格式：x-www-form-urlencoded
app.post("/devices/device", async function(req, res) {
    const {serialnumber} = req.body;
    const searchSQL = `SELECT device FROM Devices WHERE serialnumber = '${serialnumber}'`;
  
    const cnDB = database.cnDB(); 
    const connection = await cnDB.getConnection();
  
    /*檢查使用者是否存在資料庫，若無則直接建立*/
    console.log(`[${clock.consoleTime()}] HTTP POST /devices/device`);
    try {  
        const [results] = await connection.execute(searchSQL);
        const device = await results[0].device;
        if (results.length !== 0) {
            connection.release();
            console.log(`[${clock.consoleTime()}] Data: ${device}=${serialnumber} `);
            const responseMeta = {
                code: "0",
                device: device,
                serialnumber: serialnumber
            };
            res.send(responseMeta);
        }
    } catch (error) {  
        console.log(`[${clock.consoleTime()}] Error`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    } finally {
        connection.release();
    }
},catchError(errorController));