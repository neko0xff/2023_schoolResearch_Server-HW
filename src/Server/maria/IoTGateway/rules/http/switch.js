/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
/*相関函式庫*/
var mqttPubSwitch=require("../mqtt/Pubsensor.js");
var clock=require("../../modules/clock.js");
var httpServer=require("../../modules/httpServer.js");
var database=require("../../modules/database.js");
var xss = require("xss");
var error=require("../../modules/error.js");
var catchError = error.catchError;
var errorController = error.errorController;


/*資料庫&後端*/
var cnDB=null;
var app=httpServer.app();

/*開関控制*/
// GET /set/switchCtr/:deviceID/fan1 => 控制fan1
app.get("/set/switchCtr/:deviceID/fan1", async function(req, res){
    try {
        const device_ID = xss(req.params.deviceID);
        console.log(`[${clock.consoleTime()}] HTTP GET /set/switchCtr/${device_ID}/fan1`);
  
        //時間
        var date= clock.SQLDate();
        var time= clock.SQLTime();
        // Query: ?
        const status = xss(req.query.status);
        const updateSQL =`UPDATE ${device_ID}_Status SET status = ? WHERE ${device_ID}_Status.name = 'fan1'`;
        // UPDATE `Switch01_Status` SET `status`='0' WHERE `Switch01_Status`.`name`= 'fan1'
        const RecSQL = `INSERT INTO ${device_ID}_StatusRec(switch,status,date,time) VALUES ('fan1',?,?,?)`;
  
        var cnDB=database.cnDB();
        const connection = await cnDB.getConnection(); 

        /*Rec*/
        try{
            const [results, fields] = await connection.query(RecSQL,[status,date,time],{ cache: false });
        } catch (error){
            console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
            throw error;
        }

        /*Update*/
        try{
            const [results, fields] = await connection.query(updateSQL,[status],{ cache: false });
        } catch (error) {
            console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
            throw error;
        } finally {
            connection.release(); 
        }
        
        /*status*/
        let response = {};
        if (status == 1) {
            mqttPubSwitch.pubSwitch(device_ID,"fan1");
            const statusStr = "Fan1 is On!";
            console.log(`[${clock.consoleTime()}] ${statusStr}`);
            response = { status: "On" };
        } else if (status == 0) {
            mqttPubSwitch.pubSwitch(device_ID,"fan1");
            const statusStr = "Fan1 is Off!";
            console.log(`[${clock.consoleTime()}] ${statusStr}`);
            response = { status: "Off" };
        }
        res.send(response);
        return;
    } catch (error) {
        console.log(error);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    }
},catchError(errorController));


// GET /set/switchCtr/:deviceID/fan2 => 控制fan2
app.get("/set/switchCtr/:deviceID/fan2", async function(req, res){
    var device_ID=xss(req.params.deviceID);
    console.log(`[${clock.consoleTime()}] HTTP GET /set/switchCtr/${device_ID}/fan2`);
    try {
        //時間
        var date= clock.SQLDate();
        var time= clock.SQLTime();
        // Query: ?
        const status = req.query.status;
        const updateSQL =`UPDATE ${device_ID}_Status SET status = ? WHERE ${device_ID}_Status.name= 'fan2'`;
        // UPDATE `Switch01_Status` SET `status`='0' WHERE `Switch01_Status`.`name`= 'fan2'
        const RecSQL = `INSERT INTO ${device_ID}_StatusRec(switch,status,date,time) VALUES ('fan2',?,?,?)`;
  
        var cnDB=database.cnDB();
        const connection = await cnDB.getConnection(); 

        /*Rec*/
        try{
            const [results, fields] = await connection.query(RecSQL,[status,date,time],{ cache: false });
        } catch (error){
            console.log(error);
            console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
            throw error;
        }

        /*Update*/
        try{
            const [results, fields] = await connection.query(updateSQL,[status],{ cache: false });
        } catch(error) {    
            console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
            throw error;
        } finally {
            connection.release(); 
        }

        /*status*/
        let response = {};
        if (status == 1) {
            mqttPubSwitch.pubSwitch(device_ID,"fan2");
            const statusStr = "Fan2 is On!";
            console.log(`[${clock.consoleTime()}] ${statusStr}`);
            response = { status: "On" };
        } else if (status == 0) {
            mqttPubSwitch.pubSwitch(device_ID,"fan2");
            const statusStr = "Fan2 is Off!";
            console.log(`[${clock.consoleTime()}] ${statusStr}`);
            response = { status: "Off" };
        }
        res.send(response);
        return;
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = { code: "-1" };
        res.status(500).json(responseMeta);
        throw error;
    }
},catchError(errorController));

//GET /read/statusRec/:deviceID/viewALL => 檢視開関控制的記錄
app.get("/read/statusRec/:deviceID/viewALL",async function(req,res){
    //時間
    var device_ID=xss(req.params.deviceID);
    var viewSQL=`
        SELECT rec01.switch, status01.status, rec01.date, rec01.time 
        FROM (
            SELECT switch, status, date, time,
                   ROW_NUMBER() OVER(PARTITION BY switch ORDER BY date DESC, time DESC) AS rn
            FROM ${device_ID}_StatusRec
        ) AS latest
        JOIN ${device_ID}_StatusRec rec01 
        ON latest.switch = rec01.switch AND latest.date = rec01.date AND latest.time = rec01.time
        JOIN ${device_ID}_Status status01 ON rec01.switch = status01.name
        WHERE latest.rn = 1;
    `;
    console.log(`[${clock.consoleTime()}] HTTP GET /read/statusRec/${device_ID}/view`);
    
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    /*run*/
    try {
        const [results, fields] = await connection.execute(viewSQL); // 執行 SQL 查詢
        var data=JSON.stringify(results);
        res.send(results);
        console.log(`[${clock.consoleTime()}] ${data}`);
    }catch(error){
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = { code: "-1" };
        res.status(500).json(responseMeta);
        throw error;
    }finally{
        connection.release(); // 釋放連接
    }

},catchError(errorController));

//GET /read/statusNow/:deviceID/viewfan1 => 檢視fan1現在狀態
app.get("/read/statusNow/:deviceID/viewfan1",async function(req,res){
    var device_ID=xss(req.params.deviceID);
    var viewSQL=`SELECT status FROM ${device_ID}_Status WHERE name='fan1';`;
    console.log(`[${clock.consoleTime()}] HTTP GET /read/statusRec/${device_ID}/viewfan1`);
  
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    /*run*/
    try {
        const [results, fields] = await connection.execute(viewSQL); // 執行 SQL 查詢
        var data=JSON.stringify(results);
        res.send(results);
        console.log(`[${clock.consoleTime()}] ${data}`);
    }catch(error){
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = { code: "-1" };
        res.status(500).json(responseMeta);
        throw error;
    }finally{
        connection.release(); // 釋放連接
    }

},catchError(errorController));

//GET /read/statusNow/:deviceID/viewfan2 => 檢視fan2現在狀態
app.get("/read/statusNow/:deviceID/viewfan2",async function(req,res){
    var device_ID=xss(req.params.deviceID);
    var viewSQL=`SELECT status FROM ${device_ID}_Status WHERE name='fan2';`;
    console.log(`[${clock.consoleTime()}] HTTP GET /read/statusRec/${device_ID}/viewfan2`);
  
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    /*run*/
    try {
        const [results, fields] = await connection.execute(viewSQL); // 執行 SQL 查詢
        var data=JSON.stringify(results);
        res.send(results);
        console.log(`[${clock.consoleTime()}] ${data}`);
    }catch(error){
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = { code: "-1" };
        res.status(500).json(responseMeta);
        throw error;
    }finally{
        connection.release(); // 釋放連接
    }

},catchError(errorController));

//GET /read/statusNow/:deviceID/viewALL => 檢視所有開関的現在狀態
app.get("/read/statusNow/:deviceID/viewALL",async function(req,res){
    var device_ID=xss(req.params.deviceID);
    var viewSQL=`SELECT name,status FROM ${device_ID}_Status;`;
    console.log(`[${clock.consoleTime()}] HTTP GET /read/statusRec/${device_ID}/viewALL`);
  
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    /*run*/
    try {
        const [results, fields] = await connection.execute(viewSQL); // 執行 SQL 查詢
        var data=JSON.stringify(results);
        res.send(results);
        console.log(`[${clock.consoleTime()}] ${data}`);
    }catch(error){
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = { code: "-1" };
        res.status(500).json(responseMeta);
        throw error;
    }finally{
        connection.release(); // 釋放連接
    }

},catchError(errorController));
