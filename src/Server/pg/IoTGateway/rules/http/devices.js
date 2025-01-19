// deno-lint-ignore-file
/*相関函式庫*/
import clock from "../../modules/clock.js";
import httpServer from "../../modules/httpServer.js";
import database from "../../modules/database.js";
import error from "../../modules/error.js";

/*錯誤處理*/
const catchError = error.catchError;
const errorController = error.errorController;

/*資料庫&後端*/
const app=httpServer.app();

//POST /devices/serialnumber => 查詢序列號
//接收格式：x-www-form-urlencoded
app.post("/devices/serialnumber", async function(req, res) {
    const {device} = req.body;
    const cnDB = database.cnDB(); 
    const connection =  await cnDB.connect();
    const searchSQL = `
        SELECT serialnumber 
        FROM sensordb.devices 
        WHERE device = $1 ;
    `;
  
    console.log(`[${clock.consoleTime()}] HTTP POST /devices/serialnumber`);
    try {  
        const [results] = await connection.query(searchSQL,[device]);
        const serialnumber = await results[0].serialnumber;
        if (results.length !== 0) {
            const responseMeta = {
                code: "0",
                device: device,
                serialnumber: serialnumber
            };

            connection.release();
            res.send(responseMeta);
        }
    } catch (error) {  
        const responseMeta = { 
            code: "-1",
            error: error.message
         };

        console.log(`[${clock.consoleTime()}] Error`);
        res.status(500).send(responseMeta);
    } finally {
        connection.release();
    }
},catchError(errorController));

//POST /devices/device => 查詢裝置
//接收格式：x-www-form-urlencoded
app.post("/devices/device", async function(req, res) {
    const {serialnumber} = req.body;
    const cnDB = database.cnDB(); 
    const connection =  await cnDB.connect();
    const searchSQL = `
        SELECT device 
        FROM sensordb.devices 
        WHERE serialnumber = $1;
    `;
  
    console.log(`[${clock.consoleTime()}] HTTP POST /devices/device`);
    try {  
        const [results] = await connection.query(searchSQL, [serialnumber]);
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
        const responseMeta = { 
            code: "-1",
            error: error.message
         };

        console.log(`[${clock.consoleTime()}] Error`);
        res.status(500).send(responseMeta);
    } finally {
        connection.release();
    }
},catchError(errorController));
