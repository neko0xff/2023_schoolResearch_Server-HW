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

/*開發選項*/
const isDev = Deno.env.get("DEV") === "true";

if(isDev){
    // GET / => test HTTP API
    app.get("/",async function(req,res){
        const send_str = "HTTP API Server is running!";
        
        console.log(`[${clock.consoleTime()}] HTTP GET /`);
        res.send(send_str);
    },catchError(errorController));

    // GET /testDB => test DataBase Connect
    app.get("/testDB", async function(req, res) {
        const sql = `
            SELECT 1 + 1 
            AS solution
        `;

        console.log(`[${clock.consoleTime()}] HTTP GET /testDB`);
        database.handleDatabaseQuery(req, res, sql);
    },catchError(errorController));

}
