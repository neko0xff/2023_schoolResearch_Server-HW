/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
/*相関函式庫*/
var mqttPubRouter=require("../modules/mqtt/mqttPubRouter.js");
var xss = require("xss");
var clock=require("../modules/clock.js");
var httpServer=require("../modules/httpServer.js");
var database=require("../modules/database.js");

/*時間*/
var date= clock.SQLDate();
var time= clock.SQLTime();

/*資料庫*/
var cnDB=null;
var app=httpServer.app();

/*開發版上傳專用*/
//POST /upload/:deviceID/data =>  開發版上傳
app.post("/upload/:deviceID/data", async function(req, res){
    //Query: ?hum=(num)&temp=(num)
    var device_ID = xss(req.params.deviceID);
    const {hum,temp,tvoc,co,co2,pm25,o3} = req.body;
    console.log(`[${clock.consoleTime()}] HTTP POST /upload/${device_ID}/data`);

    var data=`(${hum},${temp},${tvoc},${co},${co2},${pm25},${o3},'${date}','${time}');`;
    var uploadSQL=`INSERT INTO ${device_ID}_Table(hum,temp,tvoc,co,co2,pm25,o3,date,time) VALUES ${data}`;
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    /*run*/
    try {
        const [results, fields] = await connection.execute(uploadSQL); // 執行 SQL 查詢
        var data=JSON.stringify(results);
        res.send(results);
        mqttPubRouter.pubSensorALL(device_ID);
        console.log(`[${clock.consoleTime()}] ${data}`);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = {code: "-1"};
        res.send(responseMeta);
        throw error;
    } finally{
        connection.release(); // 釋放連接
    }
});
// GET /StatusGet/:deviceID/powerStatus => 獲得電源狀態
app.get("/StatusGet/:deviceID/powerStatus",async function(req,res){
    var device_ID = xss(req.params.deviceID);
    var statusSQL = `SELECT name,status FROM ${device_ID}_Status WHERE 1;`;
    console.log(`[${clock.consoleTime()}] HTTP GET /StatusGet/${device_ID}/powerStatus`);
  
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    try {
        const [results, fields] = await connection.execute(statusSQL); // 執行 SQL 查詢
        var data=JSON.stringify(results);
        res.send(results);
        console.log("["`${clock.consoleTime()}] ${data}`);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = {code: "-1"};
        res.send(responseMeta);
        throw error;
    }finally{
        connection.release(); // 釋放連接
    }
});

/*讀值*/
// 回傳格式: JSON
//GET /read/:deviceID/ALL
app.get("/read/:deviceID/ALL", async function(req, res) {
    var device_ID = xss(req.params.deviceID);
    var readSQL = `SELECT hum,temp,tvoc,co2,co,pm25,o3,date,time FROM ${device_ID}_Table ORDER BY date DESC, time DESC LIMIT 1;`;
    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/ALL`);
    
    var cnDB = database.cnDB();
    const connection = await cnDB.getConnection(); 
    
    try {
      const [results, fields] = await connection.execute(readSQL); 
      // 將日期格式化為 "yyyy-mm-dd"
      const formattedResults = results.map(item => ({
        ...item,
        date: clock.formatDateToYYYYMMDD(item.date)
      }));
      var data = JSON.stringify(formattedResults);
      res.send(data);
      console.log(`[${clock.consoleTime()}] ${data}`);
    } catch (error) {
      console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
      const responseMeta = { code: "-1", error: error.message };
      res.status(500).send(responseMeta);
      throw error;
    } finally {
      connection.release(); // 釋放連接
    }    
});
//GET /read/:deviceID/hum => 獲得'hum'資料
app.get("/read/:deviceID/hum", async function(req, res) {
    var device_ID = xss(req.params.deviceID);
    var readSQL = `SELECT hum,date,time FROM ${device_ID}_Table ORDER BY date DESC, time DESC LIMIT 8;`;
    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/hum`);
    
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); 

    try {
        const [results, fields] = await connection.execute(readSQL); 
        // 將日期格式化為 "yyyy-mm-dd"
        const formattedResults = results.map(item => ({
            ...item,
            date: clock.formatDateToYYYYMMDD(item.date)
        }));
        var data=JSON.stringify(formattedResults);
        res.send(data);
        console.log(`[${clock.consoleTime()}] ${data}`);
    }catch (error){
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
        throw error;
    }finally{
        connection.release(); 
    }
});
//GET /read/:deviceID/temp => 獲得'temp'資料
app.get("/read/:deviceID/temp", async function(req, res) {
    var device_ID = xss(req.params.deviceID);
    var readSQL = `SELECT temp,date,time FROM ${device_ID}_Table ORDER BY date DESC, time DESC LIMIT 8;`;
    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/hum`);
    
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); 

    try {
        const [results, fields] = await connection.execute(readSQL); 

        // 將日期格式化為 "yyyy-mm-dd"
        const formattedResults = results.map(item => ({
            ...item,
            date: clock.formatDateToYYYYMMDD(item.date)
        }));

        var data = JSON.stringify(formattedResults);
        res.send(data);
        console.log(`[${clock.consoleTime()}]  ${data}`);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
        throw error;
    } finally {
        connection.release(); 
    }
});
//GET /read/:deviceID/tvoc => 獲得'tvoc'資料
app.get("/read/:deviceID/tvoc",async function(req, res){
    var device_ID=xss(req.params.deviceID);
    var readSQL=`SELECT tvoc,date,time FROM ${device_ID}_Table ORDER BY date DESC, time DESC LIMIT 8;`;
    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/tvoc`);
    
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); 

    /*run*/
    try {
        const [results, fields] = await connection.execute(readSQL); 

        // 將日期格式化為 "yyyy-mm-dd"
        const formattedResults = results.map(item => ({
            ...item,
            date: clock.formatDateToYYYYMMDD(item.date)
        }));

        var data = JSON.stringify(formattedResults);
        res.send(data);
        console.log(`[${clock.consoleTime()}]  ${data}`);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
        throw error;
    } finally {
        connection.release(); 
    }

});
//GET /read/:deviceID/co2 => 獲得'co2'資料
app.get("/read/:deviceID/co2",async function(req, res){
    var device_ID=xss(req.params.deviceID);
    var readSQL=`SELECT co2,date,time FROM ${device_ID}_Table ORDER BY ORDER BY date DESC, time DESC LIMIT 8;`;
    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/co2`);
    
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); 

    /*run*/
    try {
        const [results, fields] = await connection.execute(readSQL); 

        // 將日期格式化為 "yyyy-mm-dd"
        const formattedResults = results.map(item => ({
            ...item,
            date: clock.formatDateToYYYYMMDD(item.date)
        }));

        var data = JSON.stringify(formattedResults);
        res.send(data);
        console.log(`[${clock.consoleTime()}]  ${data}`);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
        throw error;
    } finally {
        connection.release(); 
    }
});

//GET /read/:deviceID/co => 獲得'co'資料
app.get("/read/:deviceID/co",async function(req, res){
    var device_ID=xss(req.params.deviceID);
    var readSQL=`SELECT co,date,time FROM ${device_ID}_Table ORDER BY date DESC, time DESC LIMIT 8;`;
    console.log(`[${clock.consoleTime()}]  HTTP GET /read/${device_ID}/co2`);
    
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); 
    
    /*run*/
    try {
        const [results, fields] = await connection.execute(readSQL); 
        // 將日期格式化為 "yyyy-mm-dd"
        const formattedResults = results.map(item => ({
            ...item,
            date: clock.formatDateToYYYYMMDD(item.date)
        }));
        var data = JSON.stringify(formattedResults);
        res.send(data);
        console.log(`[${clock.consoleTime()}]  ${data}`);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
        throw error;
    } finally {
        connection.release(); 
    }
});

//GET /read/:deviceID/pm25 => 獲得'pm25'資料
app.get("/read/:deviceID/pm25",async function(req, res){
    var device_ID=xss(req.params.deviceID);
    var readSQL=`SELECT pm25,date,time FROM ${device_ID}_Table ORDER BY date DESC, time DESC LIMIT 8;`;
    console.log(`[${clock.consoleTime()}]  HTTP GET /read/${device_ID}/pm25`);
  
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); 
  
    /*run*/
    try {
        const [results, fields] = await connection.execute(readSQL); 
        // 將日期格式化為 "yyyy-mm-dd"
        const formattedResults = results.map(item => ({
            ...item,
            date: clock.formatDateToYYYYMMDD(item.date)
        }));
        var data = JSON.stringify(formattedResults);
        res.send(data);
        console.log(`[${clock.consoleTime()}]  ${data}`);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
        throw error;
    } finally {
        connection.release(); 
    }
});

//GET /read/:deviceID/o3 => 獲得'o3'資料
app.get("/read/:deviceID/o3",async function(req, res){
    var device_ID=xss(req.params.deviceID);
    var readSQL=`SELECT o3,date,time FROM ${device_ID}_Table ORDER BY date DESC, time DESC LIMIT 8;`;
    console.log(`[${clock.consoleTime()}]  HTTP GET /read/${device_ID}/o3`);
  
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); 
  
    /*run*/
    try {
        const [results, fields] = await connection.execute(readSQL); 

        // 將日期格式化為 "yyyy-mm-dd"
        const formattedResults = results.map(item => ({
            ...item,
            date: clock.formatDateToYYYYMMDD(item.date)
        }));

        var data = JSON.stringify(formattedResults);
        res.send(data);
        console.log(`[${clock.consoleTime()}]  ${data}`);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
        throw error;
    } finally {
        connection.release(); 
    }
});
