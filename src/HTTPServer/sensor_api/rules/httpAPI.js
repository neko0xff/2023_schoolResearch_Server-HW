/*相関函式庫*/
var clock=require('../modules/clock.js');
var httpServer=require('../modules/httpServer.js');
var database=require('../modules/database.js');
var bcrypt = require("bcrypt");

/*時間*/
var date= clock.SQLDate();
var time= clock.SQLTime();

/*資料庫*/
var cnDB=null;
var app=httpServer.app();

/*測試是否運行*/
app.get('/',async function(req,res){
    res.send(`[${clock.consoleTime()}] API Server is running!`);
    console.log(`[${clock.consoleTime()}]  HTTP GET /`);
});
app.get('/testDB', async function(req, res) {
    var cnSql = 'SELECT 1 + 1 AS solution';
    console.log(`[${clock.consoleTime()}]  HTTP GET /testDB`);
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    try {  
      const [results, fields] = await connection.execute(cnSql); // 執行 SQL 查詢
      const dbValue = results[0].solution;
      const str = "The solution is: " + dbValue.toString();
      console.log(`[${clock.consoleTime()}] ${str}`);
      res.end('1');
    } catch (error) {
      console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
      res.end('-1');
      throw error;
    }finally{
      connection.release(); // 釋放連接
    }
});

/*開發版上傳專用*/
//api: /upload/:deviceID/data? 
app.post('/upload/:deviceID/data', async function(req, res){
    //Query: ?hum=(num)&temp=(num)
    var device_ID=req.params.deviceID;
    const { hum,temp,tvoc,co,co2,pm25,o3 } = req.query;
    console.log(`[${clock.consoleTime()}] HTTP POST /upload/${device_ID}/data`);

    var data=`(${hum},${temp},${tvoc},${co},${co2},${pm25},${o3},'${date}','${time}');`;
    var uploadSQL="INSERT INTO "+device_ID+"_Table(hum,temp,tvoc,co,co2,pm25,o3,date,time) VALUES"+data;
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    /*run*/
    try {
      const [results, fields] = await connection.execute(uploadSQL); // 執行 SQL 查詢
      var data=JSON.stringify(results);
      res.send(results);
      console.log(`[${clock.consoleTime()}] ${data}`);
    } catch (error) {
      console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
      res.send('-1');
      throw error;
    } finally{
      connection.release(); // 釋放連接
    }
});
//api: /StatusGet/:deviceID/powerStatus
app.get('/StatusGet/:deviceID/powerStatus',async function(req,res){
  var device_ID = req.params.deviceID;
  var statusSQL = "SELECT `name`,`status` FROM `"+device_ID+"_Status` WHERE 1;";
  console.log(`[${clock.consoleTime()}] HTTP GET /StatusGet/${device_ID}/powerStatus`);
  
  var cnDB=database.cnDB();
  const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

  try {
    const [results, fields] = await connection.execute(statusSQL); // 執行 SQL 查詢
    var data=JSON.stringify(results);
    res.send(results);
    console.log("["`${clock.consoleTime()}] ${data}`);
  } catch (error) {
    console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
    res.send('-1');
    throw error;
  }finally{
    connection.release(); // 釋放連接
  }

});

/*讀值*/
// api: /read/:deviceID
// 回傳格式: JSON
app.get('/read/:deviceID/hum', async function(req, res) {
    var device_ID = req.params.deviceID;
    var readSQL = 'SELECT hum,date,time FROM ' + device_ID + '_Table ORDER BY `date` AND `time` DESC LIMIT 1;';
    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/hum`);
    
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    try {
      const [results, fields] = await connection.execute(readSQL); // 執行 SQL 查詢
      var data=JSON.stringify(results);
      res.send(results);
      console.log(`[${clock.consoleTime()}] ${data}`);
    }catch (error){
      console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
      res.send('-1');
      throw error;
    }finally{
      connection.release(); // 釋放連接
    }
});
app.get('/read/:deviceID/temp', async function(req, res) {
    var device_ID = req.params.deviceID;
    var readSQL = 'SELECT temp,date,time FROM ' + device_ID + '_Table ORDER BY `date` AND `time` DESC LIMIT 1;';
    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/hum`);
    
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    try {
      const [results, fields] = await connection.execute(readSQL); // 執行 SQL 查詢
      var data=JSON.stringify(results);
      res.send(results);
      console.log(`[${clock.consoleTime()}]  ${data}`);
    } catch (error) {
      console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
      res.send('-1');
      throw error;
    }finally{
      connection.release(); // 釋放連接
    }
});

app.get('/read/:deviceID/tvoc',async function(req, res){
    var device_ID=req.params.deviceID;
    var readSQL='SELECT tvoc,date,time FROM '+ device_ID+'_Table ORDER BY `date` AND `time` DESC LIMIT 1;';
    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/tvoc`);
    
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    /*run*/
    try { 
      const [results, fields] = await connection.execute(readSQL); // 執行 SQL 查詢
      var data=JSON.stringify(results);
      res.send(results);
      console.log(`[${clock.consoleTime()}]  ${data}`);
    } catch (error) {
      console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
      res.send('-1');
      throw error;
    }finally{
      connection.release(); // 釋放連接
    }

});
app.get('/read/:deviceID/co2',async function(req, res){
    var device_ID=req.params.deviceID;
    var readSQL='SELECT co2,date,time FROM '+ device_ID+'_Table ORDER BY `date` AND `time` DESC LIMIT 1;';
    console.log(`[${clock.consoleTime()}] HTTP GET /read/${device_ID}/co2`);
    
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    /*run*/
    try {
      const [results, fields] = await connection.execute(readSQL); // 執行 SQL 查詢
      console.log(`[${clock.consoleTime()}]  ${results}`);
      res.send(results);
    } catch (error) {
      console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
      res.send('-1');
      throw error;
    }finally{
      connection.release(); // 釋放連接
    }
});
app.get('/read/:deviceID/co',async function(req, res){
    var device_ID=req.params.deviceID;
    var readSQL='SELECT co,date,time FROM '+ device_ID+'_Table ORDER BY `date` AND `time` DESC LIMIT 1;';
    console.log(`[${clock.consoleTime()}]  HTTP GET /read/${device_ID}/co2`);
    
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
    
    /*run*/
    try {
      const [results, fields] = await connection.execute(readSQL); // 執行 SQL 查詢
      var data=JSON.stringify(results);
      res.send(results);
      console.log(`[${clock.consoleTime()}] ${data}`);
    }catch (error){
      console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
      res.send('-1');
      throw error;
    }finally{
      connection.release(); // 釋放連接
    }
});
app.get('/read/:deviceID/o3',async function(req, res){
  var device_ID=req.params.deviceID;
  var readSQL='SELECT co,date,time FROM '+ device_ID+'_Table ORDER BY `date` AND `time` DESC LIMIT 1;';
  console.log(`[${clock.consoleTime()}]  HTTP GET /read/${device_ID}/co2`);
  
  var cnDB=database.cnDB();
  const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
  
  /*run*/
  try {
    const [results, fields] = await connection.execute(readSQL); // 執行 SQL 查詢
    var data=JSON.stringify(results);
    res.send(results);
    console.log(`[${clock.consoleTime()}] ${data}`);
  }catch (error){
    console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
    res.send('-1');
    throw error;
  }finally{
    connection.release(); // 釋放連接
  }
});

/*開関控制*/
app.get('/switchCtr/:deviceID/fan1', async function(req, res){
  const device_ID = req.params.deviceID;
  console.log(`[${clock.consoleTime()}] HTTP GET /switchCtr/' + device_ID + '/fan1'`);
  
  // Query: ?
  const status = req.query.status;
  const updateSQL ="UPDATE `" + device_ID + "_Status` SET `status`= '" +status +"'  WHERE `"+ device_ID +"_Status`.`name`= 'fan1'";
  // UPDATE `Switch01_Status` SET `status`='0' WHERE `Switch01_Status`.`name`= 'fan1'
  var Recdata= `('fan1',${status},'${date}','${time}')`;
  const RecSQL = "INSERT INTO `"+ device_ID +"_StatusRec`(`switch`, `status`, `date`, `time`) VALUES " + Recdata;
  
  /*Update*/
  try{
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
    const [results, fields] = await connection.execute(updateSQL); // 執行 SQL 查詢
    connection.release(); // 釋放連接
  } catch (error) {
    console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
    res.send('-1');
    throw error;
  }finally{
    
  }

  /*Rec*/
  try{
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
    const [results, fields] = await connection.execute(RecSQL); // 執行 SQL 查詢
  }catch (error){
    console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
    res.send('-1');
    throw error;
  }finally{
    
  }

  /*status*/
  try {
    if (status == 1) {
      const statusStr = `${device_ID} is On!`;
      console.log(`[${clock.consoleTime()}] ${statusStr}`);
      res.send(status);
    } else if (status == 0) {
      const statusStr = `${device_ID} is Off!`;
      console.log(`[${clock.consoleTime()}] ${statusStr}`);
      res.send(status);
    }
  } catch (error) {
    console.log(error);
  }

  connection.release(); // 釋放連接
});
app.get('/switchCtr/:deviceID/fan2', async function(req, res){
  const device_ID = req.params.deviceID;
  console.log(`[${clock.consoleTime()}] HTTP GET /switchCtr/${device_ID}/fan2`);

  // Query: ?
  const status = req.query.status;
  const updateSQL ="UPDATE `" + device_ID + "_Status` SET `status`= '" +status +"'  WHERE `"+ device_ID +"_Status`.`name`= 'fan2'";
  var Recdata= "('fan2',"+ status +",'"+ date +"','"+ time +"')";
  const RecSQL = "INSERT INTO `"+ device_ID +"_StatusRec`(`switch`, `status`, `date`, `time`) VALUES " + Recdata;
  
  /*Update*/
   try{  
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接  
    const [results, fields] = await connection.execute(updateSQL); // 執行 SQL 查詢
    var data=JSON.stringify(results);
    console.log(`[${clock.consoleTime()}] ${data}`);  
  } catch (error) {
    console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
    res.send('-1');
    throw error;
  }finally{
    connection.release(); // 釋放連接  
  }

  /*Rec*/
  try{
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
    const [results, fields] = await connection.execute(RecSQL); // 執行 SQL 查詢
    res.send(results);
  }catch (error){
    console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
    res.send('-1');
    throw error;
  }finally{
    connection.release(); // 釋放連接  
  }

  /*status*/
  try {
      if (status == 1) {
        const statusStr = device_ID + ' is On!';
        console.log(`[${clock.consoleTime()}] ${statusStr}`);
        res.send(status);
      } else if (status == 0) {
        const statusStr = device_ID + ' is Off!';
        console.log(`[${clock.consoleTime()}] ${statusStr}`);
        res.send(status);
      }
  } catch (error) {
      console.log(error);
  }

});

/*檢視開関控制的記錄*/
app.get('/statusRec/:deviceID/view',async function(req,res){
    var device_ID=req.params.deviceID;
    var viewSQL='SELECT * FROM '+ device_ID+'_StatusRec ORDER BY `date` AND `time` DESC LIMIT 1;';
    console.log(`[${clock.consoleTime()}] HTTP GET /statusRec/${device_ID}/view`);
    
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
      res.send('-1');
      throw error;
    }finally{
      connection.release(); // 釋放連接
    }

});

//使用者認証
/*建立使用者*/
//接收格式：x-www-form-urlencoded
app.post("/CreateUser", async function(req, res) {
  const { username, password, LoginName } = req.body;
  var salt = 10;
  const hashedPassword = bcrypt.hashSync(password, salt);
  const searchSQL = `SELECT * FROM Users WHERE username = '${username}'`;
  var userData = `('${username}','${hashedPassword}','${LoginName}')`;
  var addUserSQL = `INSERT INTO Users (username, password, LoginName) VALUES ${userData}`;

  const cnDB = database.cnDB(); 
  const connection = await cnDB.getConnection();
  
  /*檢查使用者是否存在資料庫，若無則直接建立*/
  try {  
    const [results] = await connection.execute(searchSQL);
    if (results.length !== 0) {
      connection.release();
      console.log(`[${clock.consoleTime()}] ${username} already created!`);
      res.send('0'); 
    } else {
      await connection.execute(addUserSQL);
      console.log(`[${clock.consoleTime()}] ${username} created successfully`);
      res.send('1');
    }
  } catch (error) {  
    console.log(`[${clock.consoleTime()}] Error creating ${username}`);
    res.send('-1');
  } finally {
    connection.release();
  }
});

/*使用者*/
//接收格式：x-www-form-urlencoded
app.post("/Login", async function(req, res) {
  const { username, password } = req.body;
  const searchSQL = `SELECT * FROM Users WHERE username = '${username}'`;

  const cnDB = database.cnDB(); 
  const connection = await cnDB.getConnection();
  
  /*檢查使用者是否存在資料庫且比對傳送過來的資料是否一致*/
  try {  
    const [results] = await connection.execute(searchSQL);
    if (results.length == 0) {
      connection.release();
      console.log(`[${clock.consoleTime()}] ${username} is Not Found!`);
      res.send('0'); 
    } else {
      const hashedPassword = results[0].password;
      if (await bcrypt.compare(password, hashedPassword)) {
        console.log(`[${clock.consoleTime()}] ${username} is Login Successful!`);
        res.send('1');
      }else{
        console.log(`[${clock.consoleTime()}] ${username} is Password incorrect!!`)
        res.send('0');
      } 
    }
  } catch (error) {
    console.log(`[${clock.consoleTime()}] Error Login`);
    res.send('-1');
  } finally {
    connection.release();
  }
});