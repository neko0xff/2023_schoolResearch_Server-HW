/*相関函式庫*/
var clock=require("../../modules/clock.js");
var httpServer=require("../../modules/httpServer.js");
var database=require("../../modules/database.js");
var error=require("../../modules/error.js");
var catchError = error.catchError;
var errorController = error.errorController;

/*資料庫&後端*/
var app=httpServer.app();

// GET /users/userlist: 查詢資料庫上的使用者列表
// 接收格式：x-www-form-urlencoded
app.get("/users/userlist",async function(req, res){
    const sql=`
        SELECT username,loginname AS "LoginName",email 
        FROM sensordb.users
    `;

    console.log(`[${clock.consoleTime()}] HTTP GET /users/userlist`);
    database.handleDatabaseQuery(req, res, sql);
},catchError(errorController));

// GET /users/usecustomValue: 查詢資料庫上的使用者的自訂值
// 接收格式：x-www-form-urlencoded
app.get("/users/usecustomValue",async function(req, res){
    const sql=`
        SELECT loginname AS "LoginName",customvar01,customvar02,customvar03,customvar04,customvar05,customvar06,customvar07 
        FROM sensordb.users;
    `;

    console.log(`[${clock.consoleTime()}] HTTP GET /users/usecustomValue`);
    database.handleDatabaseQuery(req, res, sql);
},catchError(errorController));

// GET /users/Modeview: 查詢資料庫上的使用者的方案
// 接收格式：x-www-form-urlencoded
app.get("/users/Modeview",async function(req, res){
    const sql =`
        SELECT username,mode AS "Mode"
        FROM sensordb.users;
    `;

    console.log(`[${clock.consoleTime()}] HTTP GET /users/Modeview`);
    database.handleDatabaseQuery(req, res, sql);
},catchError(errorController));

// POST /user/ModeChoose => 設置使用者方案
// 接收格式：x-www-form-urlencoded
app.post("/user/ModeChoose", async function (req, res) {
    const { username, Mode } = req.body;
    const cnDB = database.cnDB();
    const connection = await cnDB.connect();
    const searchSQL = `
        SELECT username 
        FROM sensordb.users 
        WHERE username = $1
    `; 
    const UPDATEUserSQL = `
        UPDATE sensordb.users 
        SET mode = $1
        WHERE username = $2
    `;

    console.log(`[${clock.consoleTime()}] HTTP POST /user/ModeChoose`);

    if (!username || Mode === undefined) {
        const responseMeta = { 
            code: "-1",
            error: "Missing data in request"
         };
         
        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        return res.status(400).send(responseMeta);
    }

    if (Mode !== "A" && Mode !== "B" && Mode !== "C") {
        const responseMeta = { code: "-1", error: `Unauthorized access. '${Mode}' is not a valid value.` };
        console.log(`[${clock.consoleTime()}] Unauthorized access. ${Mode} is not a valid value.`);
        return res.status(403).send(responseMeta);
    }

    try {
        const result = await connection.query(searchSQL, [username]); 

        if (result.rows.length === 0) {  
            const responseMeta = { 
                code: "0", 
                message: `${username} is not found in the database!`
            };

            connection.release();
            console.log(`[${clock.consoleTime()}] ${username} is not found in the database!`);
            return res.send(responseMeta); 
        }

        await connection.query(UPDATEUserSQL, [Mode, username]);
        const responseMeta = { 
            code: "1",
            message: `${username}'s Mode updated to ${Mode} successfully`
         };

        console.log(`[${clock.consoleTime()}] ${username}'s Mode updated to ${Mode} successfully`);
        res.send(responseMeta);
    } catch (error) {
        const responseMeta = { 
            code: "-1", 
            error: error.message 
        };

        console.error(`[${clock.consoleTime()}] ${username}'s Mode update error: ${error.message}`);
        res.status(500).send(responseMeta);
    } finally {
        connection.release();
    }
}, catchError(errorController));
