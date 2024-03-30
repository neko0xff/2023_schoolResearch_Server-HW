/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */

/*相関函式庫*/
var mqttPubUser=require("../mqtt/Pubuser.js");
var clock=require("../../modules/clock.js");
var httpServer=require("../../modules/httpServer.js");
var database=require("../../modules/database.js");
var error=require("../../modules/error.js");
var catchError = error.catchError;
var errorController = error.errorController;

/*資料庫&後端*/
var cnDB=null;
var app=httpServer.app();

// GET /read/UserCustomValueStatus => 讀取使用者相關資料
// 接收格式：x-www-form-urlencoded
app.get("/read/UserCustomValueStatus", async function (req, res) {
    console.log(`[${clock.consoleTime()}] HTTP GET /read/UserCustomValue`);
    const { username, ValueName } = req.query; // 使用 req.body 來取得 POST 資料

    // 檢查是否有缺少必要的資料
    if (!username || !ValueName) {
        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        const responseMeta = { code: "-1", error: "Missing data in request" };
        return res.status(400).send(responseMeta);
    }

    const ReadSQL = `SELECT ${ValueName} FROM Users WHERE username = ?`;
    const cnDB = database.cnDB();
    const connection = await cnDB.getConnection();

    try {
        const [results] = await connection.execute(ReadSQL, [username],{ cache: false });
        
        if (results.length === 0) {
            console.log(`[${clock.consoleTime()}] ${username} not found in the database.`);
            const responseMeta = { code: "0", message: `${username} not found in the database` };
            return res.status(404).send(responseMeta);
        }

        const value = results[0][ValueName]; // 從查詢結果中取得相應的值
        console.log(`[${clock.consoleTime()}] ${username}'s ${ValueName} retrieved successfully`);
        const responseMeta = {
            code: "1",
            username: username,
            [ValueName]: value, // 使用中括號動態生成屬性名稱
        };
        res.send(responseMeta);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] ${username}'s ${ValueName} retrieval error: ${error.message}`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    } finally {
        connection.release();
    }
},catchError(errorController));

// GET /read/UserCustomValueRec => 查詢使用者的自訂值的記錄
// 接收格式：x-www-form-urlencoded
app.get("/read/UserCustomValueRec", async function(req, res) {
    console.log(`[${clock.consoleTime()}] HTTP GET /read/UserCustomValueRec`);
    const { username} = req.body; // 使用 req.body 來取得 POST 資料

    // 檢查是否有缺少必要的資料
    if (!username) {
        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        const responseMeta = { code: "-1", error: "Missing data in request" };
        return res.status(400).send(responseMeta);
    }

    var readSQL = `SELECT username,ValueName,date,time FROM customVar_StatusRec WHERE username = ? ORDER BY date DESC, time DESC LIMIT 1;`;
    
    var cnDB = database.cnDB();
    const connection = await cnDB.getConnection(); 
    
    try {
      const [results, fields] = await connection.query(readSQL,[username], { cache: false });
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
},catchError(errorController));

// POST /read/UsersComparisonResult => 查詢使用者自訂值和Sensor的比對記錄
// 接收格式：x-www-form-urlencoded
app.post("/read/UsersComparisonResult", async function(req, res) {
    console.log(`[${clock.consoleTime()}] HTTP POST /read/UsersComparisonResult`);
    const { username} = req.body; // 使用 req.body 來取得 POST 資料

    // 檢查是否有缺少必要的資料
    if (!username) {
        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        const responseMeta = { code: "-1", error: "Missing data in request" };
        return res.status(400).send(responseMeta);
    }

    var readSQL = `
        SELECT
            CASE WHEN Sensor01_Table.hum > Users.customvar01 THEN 1 ELSE 0 END AS comparison_result_hum,
            CASE WHEN Sensor01_Table.temp > Users.customvar02 THEN 1 ELSE 0 END AS comparison_result_temp,
            CASE WHEN Sensor01_Table.tvoc > Users.customvar03 THEN 1 ELSE 0 END AS comparison_result_tvoc,
            CASE WHEN Sensor01_Table.co > Users.customvar04 THEN 1 ELSE 0 END AS comparison_result_co,
            CASE WHEN Sensor01_Table.co2 > Users.customvar05 THEN 1 ELSE 0 END AS comparison_result_co2,
            CASE WHEN Sensor01_Table.pm25 > Users.customvar06 THEN 1 ELSE 0 END AS comparison_result_pm25,
            CASE WHEN Sensor01_Table.o3 > Users.customvar07 THEN 1 ELSE 0 END AS comparison_result_o3
        FROM
            Sensor01_Table
        CROSS JOIN
            Users
        WHERE 
            Users.username = ?
        ORDER BY
            Sensor01_Table.date DESC,
            Sensor01_Table.time DESC
        LIMIT 1;
    `;
    var cnDB = database.cnDB();
    const connection = await cnDB.getConnection(); 
    
    try {
      const [results, fields] = await connection.query(readSQL,[username], { cache: false });
      // 將日期格式化為 "yyyy-mm-dd"
      const formattedResults = results.map(item => ({
        ...item,
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
},catchError(errorController));

// POST /Set/UserCustomValue => 改變使用者相關資料
// 接收格式：x-www-form-urlencoded
app.post("/set/UserCustomValue", async function (req, res) {
    //時間
    var date= clock.SQLDate();
    var time= clock.SQLTime();
    console.log(`[${clock.consoleTime()}] HTTP POST /set/UserCustomValue`);
    const { username, ValueName, num } = req.body;

    if (!username || !ValueName || num === undefined) {
        // 檢查是否有缺少必要的資料
        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        const responseMeta = { code: "-1", error: "Missing data in request" };
        return res.status(400).send(responseMeta);
    }

    const searchSQL = `SELECT username, ${ValueName} FROM Users WHERE username = ?`;
    const UPDATEUserSQL = `UPDATE Users SET ${ValueName} = ? WHERE username = ?`;
    const RecSQL = `INSERT INTO customVar_StatusRec(username,ValueName,num,date,time) VALUES (?,?,?,?,?);`;

    const cnDB = database.cnDB();
    const connection = await cnDB.getConnection();

    /*Rec*/
    try{
        const [results, fields] = await connection.query(RecSQL,[username,ValueName,num], { cache: false });;
    } catch (error){
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        throw error;
    }

    /*檢查使用者是否存在資料庫，若無則直接改變*/
    try {
        const [results] = await connection.execute(searchSQL, [username]);

        if (results.length !== 0) {
            await connection.execute(UPDATEUserSQL, [num, username]);
            console.log(`[${clock.consoleTime()}] ${username}'s ${ValueName} updated successfully`);
            const responseMeta = { code: "1" };
            res.send(responseMeta);
            mqttPubUser.pubUsersComparisonResultALL();
            mqttPubUser.pubCustomValueALL();
        } else {
            connection.release();
            console.log(`[${clock.consoleTime()}] ${username} is Not Found in Database!`);
            const responseMeta = { code: "0" };
            res.send(responseMeta);
        }
    } catch (error) {
        console.log(`[${clock.consoleTime()}] ${username}'s ${ValueName} Error update: ${error.message}`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    } finally {
        connection.release();
    }
},catchError(errorController));

