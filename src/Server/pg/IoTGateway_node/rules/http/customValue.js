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
    const { username, ValueName } = req.query; 
    const cnDB = database.cnDB();
    let connection = await cnDB.connect();
    const ReadSQL = `
        SELECT ${ValueName}
        FROM sensordb.users 
        WHERE username = $1
    `;

    console.log(`[${clock.consoleTime()}] HTTP GET /read/UserCustomValueStatus`);
    if (!username || !ValueName) {
        const responseMeta = { 
            code: "-1", 
            error: "Missing data in request" 
        };

        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        return res.status(400).send(responseMeta);
    }

    try {
        const result = await connection.query(ReadSQL,[username]);

        if (result.rows.length === 0) {
            const responseMeta = { 
                code: "0", 
                message: `${username} not found in the database` 
            };

            console.log(`[${clock.consoleTime()}] ${username} not found in the database.`);
            return res.status(404).send(responseMeta);
        }

        const value = result.rows[0][ValueName]; 
        const responseMeta = {
            code: "1",
            username: username,
            [ValueName]: parseInt(value), 
        };

        console.log(`[${clock.consoleTime()}] ${username}'s ${ValueName} retrieved successfully`);
        res.send(responseMeta);
    } catch (error) {
        const responseMeta = { 
            code: "-1", 
            error: error.message 
        };

        console.error(`[${clock.consoleTime()}] ${username}'s ${ValueName} retrieval error:`, error);
        res.status(500).send(responseMeta);
    } finally {
        if (connection) {
            connection.release();
        }
    }
},catchError(errorController));

// GET /read/UserCustomValueRec => 查詢使用者的自訂值的記錄
// 接收格式：x-www-form-urlencoded
app.get("/read/UserCustomValueRec", async function(req, res) {
    const { username} = req.body; 
    var readSQL = `
        SELECT username,valuename AS "ValueName",date,time 
        FROM sensordb.customvar_statusrec 
        WHERE username = $1
        ORDER BY date DESC, time DESC LIMIT 1;
    `;
    
    console.log(`[${clock.consoleTime()}] HTTP GET /read/UserCustomValueRec`);
    if (!username) {
        const responseMeta = { 
            code: "-1",
            error: "Missing data in request" 
        };

        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        return res.status(400).send(responseMeta);
    }
    database.handleDatabaseQuery(req, res,  readSQL,[username]); 
},catchError(errorController));

// POST /read/UsersComparisonResult => 查詢使用者自訂值和Sensor的比對記錄
// 接收格式：x-www-form-urlencoded
app.post("/read/UsersComparisonResult", async function(req, res) {
    const { username } = req.body;
    const sql = `
        SELECT
            CASE WHEN sensordb.sensor01_table.hum > sensordb.users.customvar01 THEN 1 ELSE 0 END AS comparison_result_hum,
            CASE WHEN sensordb.sensor01_table.temp > sensordb.users.customvar02 THEN 1 ELSE 0 END AS comparison_result_temp,
            CASE WHEN sensordb.sensor01_table.tvoc > sensordb.users.customvar03 THEN 1 ELSE 0 END AS comparison_result_tvoc,
            CASE WHEN sensordb.sensor01_table.co > sensordb.users.customvar04 THEN 1 ELSE 0 END AS comparison_result_co,
            CASE WHEN sensordb.sensor01_table.co2 > sensordb.users.customvar05 THEN 1 ELSE 0 END AS comparison_result_co2,
            CASE WHEN sensordb.sensor01_table.pm25 > sensordb.users.customvar06 THEN 1 ELSE 0 END AS comparison_result_pm25,
            CASE WHEN sensordb.sensor01_table.o3 > sensordb.users.customvar07 THEN 1 ELSE 0 END AS comparison_result_o3
        FROM
            sensordb.sensor01_table
        INNER JOIN
            sensordb.users ON sensordb.users.username = $1
        ORDER BY
            sensordb.sensor01_table.date DESC,
            sensordb.sensor01_table.time DESC
        LIMIT 1;
    `;

    console.log(`[${clock.consoleTime()}] HTTP GET /read/UsersComparisonResult`);
    console.log(`[${clock.consoleTime()}] Executing query for username: ${username}`);
    if (!username) {
        const responseMeta = { 
            code: "-1",
            error: "Missing data in request" 
        };

        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        return res.status(400).send(responseMeta);
    }

    try {
        await database.handleDatabaseQuery(req, res, sql, [username]);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Error fetching comparison result for user: ${username}`, error);
        res.status(500).send({ code: "-1", error: error.message });
    }
});

// POST /set/UserCustomValue => 改變使用者相關資料
// 接收格式：x-www-form-urlencoded
app.post("/set/UserCustomValue", async function (req, res) {
    const { username, ValueName, num } = req.body;
    const cnDB = database.cnDB();
    let connection = await cnDB.connect();
    const date = clock.SQLDate();
    const time = clock.SQLTime();
    const RecSQL = `
        INSERT INTO sensordb.customVar_StatusRec(username, valuename, num, date, time) 
        VALUES ($1, $2, $3, $4, $5)
    `;
    const searchSQL = `
        SELECT username, ${ValueName} 
        FROM sensordb.users 
        WHERE username = $1
    `;
    const UPDATEUserSQL = `
        UPDATE sensordb.users 
        SET ${ValueName} = $1
        WHERE username = $2
    `;

    console.log(`[${clock.consoleTime()}] HTTP POST /set/UserCustomValue`);

    if (!username || !ValueName || num === undefined) {
        const responseMeta = { 
            code: "-1",
            error: "Missing data in request" 
        };

        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        return res.status(400).send(responseMeta);
    }

    try {
        const result = await connection.query(searchSQL, [username]);
        await connection.query(RecSQL, [username, ValueName, num, date, time]);
        console.log(`[${clock.consoleTime()}] Record inserted successfully`);

        if (result.rows && result.rows.length > 0) {
            const responseMeta = { 
                code: "1",
                message: `Updated ${ValueName} to ${num} successfully` 
             };

            await connection.query(UPDATEUserSQL, [num, username]);
            console.log(`[${clock.consoleTime()}] ${username}'s ${ValueName} updated successfully`);
            res.send(responseMeta);
            mqttPubUser.pubUsersComparisonResultALL();
            mqttPubUser.pubCustomValueALL();
        } else {
            const responseMeta = { 
                code: "0",
                message: '${username} is Not Found in Database!'
             };

            console.log(`[${clock.consoleTime()}] ${username} is Not Found in Database!`);
            res.send(responseMeta);
        }
    } catch (error) {
        const responseMeta = { 
            code: "-1",
            error: error.message
        };

        console.error(`[${clock.consoleTime()}] Error : ${error.message}`);
        res.status(500).send(responseMeta);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}, catchError(errorController));