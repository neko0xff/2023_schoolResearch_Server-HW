/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */

/*相関函式庫*/
var clock=require("../modules/clock.js");
var httpServer=require("../modules/httpServer.js");
var database=require("../modules/database.js");

/*時間*/
var date= clock.SQLDate();
var time= clock.SQLTime();

/*資料庫*/
var cnDB=null;
var app=httpServer.app();

// GET /Read/UserCustomValueStatus => 讀取使用者相關資料
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
        const [results] = await connection.execute(ReadSQL, [username]);
        
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
});

// GET /Read/UserCustomValueRec => 查詢使用者的自訂值的記錄
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

    var readSQL = `SELECT username,ValueName,date,time FROM customVar_StatusRec WHERE username = '${username}' ORDER BY date DESC, time DESC LIMIT 1;`;
    
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

// POST /Set/UserCustomValue => 改變使用者相關資料
// 接收格式：x-www-form-urlencoded
app.post("/set/UserCustomValue", async function (req, res) {
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
    var Recdata= `('${username}','${ValueName}','${num}','${date}','${time}')`;
    const RecSQL = `INSERT INTO customVar_StatusRec(username,ValueName,num,date,time) VALUES` + Recdata;

    const cnDB = database.cnDB();
    const connection = await cnDB.getConnection();

    /*Rec*/
    try{
        const [results, fields] = await connection.execute(RecSQL); 
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
});

