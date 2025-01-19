/*相関函式庫*/
var clock=require("../../modules/clock.js");
var httpServer=require("../../modules/httpServer.js");
var database=require("../../modules/database.js");
var error=require("../../modules/error.js");
var catchError = error.catchError;
var errorController = error.errorController;

/*資料庫&後端*/
var app=httpServer.app();

// GET / => test HTTP API
app.get("/",async function(req,res){
    const send_str = "HTTP API Server is running!";
    
    console.log(`[${clock.consoleTime()}] HTTP GET /`);
    res.send(send_str);
},catchError(errorController));

// GET /testDB => test DataBase Connect
app.get("/testDB", async function(req, res) {
    var sql = `
        SELECT 1 + 1 
        AS solution
    `;

    console.log(`[${clock.consoleTime()}] HTTP GET /testDB`);
    database.handleDatabaseQuery(req, res, sql);
},catchError(errorController));
