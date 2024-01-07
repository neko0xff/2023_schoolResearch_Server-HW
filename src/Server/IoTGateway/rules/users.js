/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
/*相関函式庫*/
var bcrypt=require("bcrypt");
var clock=require("../modules/clock.js");
var httpServer=require("../modules/httpServer.js");
var database=require("../modules/database.js");
var error=require("../modules/error.js");
var catchError = error.catchError;
var errorController = error.errorController;

/*資料庫&後端*/
var cnDB=null;
var app=httpServer.app();

//GET /users/userlist: 查詢資料庫上的使用者
//接收格式：x-www-form-urlencoded
app.get("/users/userlist",async function(req, res){
    const listSQL="SELECT username,LoginName,email FROM Users;";
    const cnDB = database.cnDB(); 
    const connection = await cnDB.getConnection();
    console.log(`[${clock.consoleTime()}] HTTP GET /users/userlist`);
    
    try{
        const [results, fields] = await connection.execute(listSQL); 
        const formattedResults = results.map(item => ({
            ...item
        }));
        var data = JSON.stringify(formattedResults);
        res.send(data);
        console.log(`[${clock.consoleTime()}] ${data}`);
    }catch(error){
        console.log(`[${clock.consoleTime()}] Error `);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    }finally{
        connection.release();
    }
},catchError(errorController));
