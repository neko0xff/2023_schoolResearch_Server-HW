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

//GET /users/userlist: 查詢資料庫上的使用者列表
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

//GET /users/usecustomValue: 查詢資料庫上的使用者的自訂值
//接收格式：x-www-form-urlencoded
app.get("/users/usecustomValue",async function(req, res){
    const listSQL="SELECT LoginName,customvar01,customvar02,customvar03,customvar04,customvar05,customvar06,customvar07 FROM Users;";
    const cnDB = database.cnDB(); 
    const connection = await cnDB.getConnection();
    console.log(`[${clock.consoleTime()}] HTTP GET /users/usecustomValue`);
    
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

// POST /user/ModeChoose => 選項
// 接收格式：x-www-form-urlencoded
app.post("/user/ModeChoose", async function (req, res) {
    //時間
    console.log(`[${clock.consoleTime()}] HTTP POST /user/ModeChoose`);
    const { username, Mode } = req.body;

    if (!username === undefined) {
        // 檢查是否有缺少必要的資料
        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        const responseMeta = { code: "-1", error: "Missing data in request" };
        return res.status(400).send(responseMeta);
    }

    const UPDATEUserSQL = `UPDATE Users SET ${Mode} = ? WHERE username = ?`;
    const cnDB = database.cnDB();
    const connection = await cnDB.getConnection();

    /*檢查使用者是否存在資料庫，若無則直接改變*/
    try {
        const [results] = await connection.execute(UPDATEUserSQL, [username]);

        if (results.length !== 0) {
            await connection.execute(UPDATEUserSQL, [Mode, username]);
            console.log(`[${clock.consoleTime()}] ${username}'s ${Mode} updated successfully`);
            const responseMeta = { code: "1" };
            res.send(responseMeta);
        } else {
            connection.release();
            console.log(`[${clock.consoleTime()}] ${username} is Not Found in Database!`);
            const responseMeta = { code: "0" };
            res.send(responseMeta);
        }
    } catch (error) {
        console.log(`[${clock.consoleTime()}] ${username}'s ${Value} Error update: ${error.message}`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    } finally {
        connection.release();
    }
},catchError(errorController));

//GET /users/Modeview: 查詢資料庫上的使用者的模式
//接收格式：x-www-form-urlencoded
app.get("/users/Modeview",async function(req, res){
    const listSQL="SELECT LoginName,Mode FROM Users;";
    const cnDB = database.cnDB(); 
    const connection = await cnDB.getConnection();
    console.log(`[${clock.consoleTime()}] HTTP GET /users/Modeview`);
    
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