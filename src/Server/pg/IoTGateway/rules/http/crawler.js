// deno-lint-ignore-file
/*相関函式庫*/
import clock from "../../modules/clock.js";
import httpServer from "../../modules/httpServer.js";
import database from "../../modules/database.js";
import error from "../../modules/error.js";

/*錯誤處理*/
const catchError = error.catchError;
const errorController = error.errorController;

/* 資料庫 & 後端 */
const app=httpServer.app();

/*查詢己爬蟲爬到的資料*/
// GET /crawler/AQI/ALL => 全部測站的資料
app.get("/read/crawler/AQI/ALL",async function(req, res) {
    const sql = `
        SELECT siteid, sitename, aqi, monitordate 
        FROM sensordb.aqx_p_434 
        ORDER BY siteid ASC;
    `;

    console.log(`[${clock.consoleTime()}] HTTP GET/read/crawler/AQI/ALL`);
    database.handleDatabaseQuery(req, res, sql);
},catchError(errorController));

// GET /read/crawler/AQI/site => 指定特定測站的資料
app.get("/read/crawler/AQI/site", async function(req, res) {
    const { sitename } = req.query;
    const sql = `
        SELECT siteid, sitename, aqi, monitordate 
        FROM sensordb.aqx_p_434 
        WHERE sitename = $1
        ORDER BY siteid ASC;
    `;

    console.log(`[${clock.consoleTime()}] HTTP GET/read/crawler/AQI/site`);
    database.handleDatabaseQuery(req, res, sql, [sitename]);
},catchError(errorController));

// GET /read/crawler/CFoot/ALL => 全部物品的資料
app.get("/read/crawler/CFoot/ALL",async function(req, res) {
    const sql = `
        SELECT id,name,coe,unit,departmentname,announcementyear 
        FROM sensordb.cfp_p_02 
        ORDER BY id ASC;
    `;
     
    console.log(`[${clock.consoleTime()}] HTTP GET /read/crawler/CFoot/ALL`);
    database.handleDatabaseQuery(req, res, sql);
},catchError(errorController));

// GET /read/crawler/Cfoot/name => 指定特定物品的資料
app.get("/read/crawler/Cfoot/name", async function(req, res) {
    const {name} = req.query;
    const sql = `
        SELECT id, name, coe, unit, departmentname, announcementyear 
        FROM sensordb.cfp_p_02 
        WHERE name = $1
        ORDER BY id ASC;
    `;
    
    console.log(`[${clock.consoleTime()}] HTTP GET /read/crawler/Cfoot/name`);
    database.handleDatabaseQuery(req, res, sql,[name]);
},catchError(errorController));


// GET /read/crawler/CFoot/list => 物品名
app.get("/read/crawler/CFoot/list",async function(req, res) {
    const sql = `
        SELECT id,name 
        FROM sensordb.cfp_p_02 
        ORDER BY id ASC;
    `;

    console.log(`[${clock.consoleTime()}] HTTP GET /read/crawler/CFoot/list`);
    database.handleDatabaseQuery(req, res, sql);
},catchError(errorController));
