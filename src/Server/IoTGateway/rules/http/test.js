/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */

/*相関函式庫*/
var clock=require("../../modules/clock.js");
var httpServer=require("../../modules/httpServer.js");
var database=require("../../modules/database.js");
var error=require("../../modules/error.js");
var catchError = error.catchError;
var errorController = error.errorController;

/*資料庫&後端*/
var cnDB=null;
var app=httpServer.app();

/*測試是否運行*/
// GET / => test HTTP API
app.get("/",async function(req,res){
    res.send("HTTP API Server is running!");
    console.log(`[${clock.consoleTime()}] HTTP GET /`);
},catchError(errorController));
// GET /testDB => test DataBase Connect
app.get("/testDB", async function(req, res) {
    var cnSql = "SELECT 1 + 1 AS solution";
    console.log(`[${clock.consoleTime()}] HTTP GET /testDB`);
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    try {  
        const [results, fields] = await connection.execute(cnSql); // 執行 SQL 查詢
        const dbValue = results[0].solution;
        const str = `The solution is: ${dbValue.toString()}`;
        console.log(`[${clock.consoleTime()}] ${str}`);
        const responseMeta = {code: "1"};
        res.send(responseMeta);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = {code: "-1"};
        res.send(responseMeta);
        throw error;
    }finally{
        connection.release(); // 釋放連接
    }
},catchError(errorController));
