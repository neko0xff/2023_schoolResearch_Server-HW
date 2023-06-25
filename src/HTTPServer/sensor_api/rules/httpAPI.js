/*相関函式庫*/
var clock=require('../modules/clock.js');
var httpServer=require('../modules/httpServer.js');
var database=require('../modules/database.js');
const bcrypt = require("bcrypt")

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
      res.end(str);
    } catch (error) {
      console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
      res.end('無法連線');
      throw error;
    }finally{
      connection.release(); // 釋放連接
    }
});

/*開發版上傳專用*/
//api: /upload/:deviceID/data? 
app.post('/upload/:deviceID/data', async function(req, res){
    var device_ID=req.params.deviceID;
    console.log(`[${clock.consoleTime()}] HTTP POST /upload/${device_ID}/data`);

    //Query: ?hum=(num)&temp=(num)
    var hum=req.query.hum; 
    var temp=req.query.temp; 
    var tvoc=req.query.tvoc;
    var co=req.query.co;
    var co2=req.query.co2;
    var pm25=req.query.pm25;
    var o3=req.query.o3;
    var data="("+hum+","+temp+","+tvoc+","+co+","+ co2+"," + pm25+","+ o3 +",'"+date+"','"+time+"');";
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
      res.send('無法連線');
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
    res.send("無法連線");
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
      res.send('無法連線');
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
      res.send('無法連線');
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
      res.send('無法連線');
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
      res.send('無法連線');
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
      res.send('無法連線');
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
    res.send('無法連線');
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
  var Recdata= "('fan1',"+ status +",'"+ date +"','"+ time +"')";
  const RecSQL = "INSERT INTO `"+ device_ID +"_StatusRec`(`switch`, `status`, `date`, `time`) VALUES " + Recdata;
  
  /*Update*/
  try{
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
    const [results, fields] = await connection.execute(updateSQL); // 執行 SQL 查詢
    connection.release(); // 釋放連接
  } catch (error) {
    console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
    res.send('無法連線');
    throw error;
  }finally{
    
  }

  /*Rec*/
  try{
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
    const [results, fields] = await connection.execute(RecSQL); // 執行 SQL 查詢
    connection.release(); // 釋放連接
  }catch (error){
    console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
    res.send('無法連線');
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
    connection.release(); // 釋放連接
  } catch (error) {
    console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
    res.send('無法連線');
    throw error;
  }finally{
      
  }

  /*Rec*/
  try{
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
    const [results, fields] = await connection.execute(RecSQL); // 執行 SQL 查詢
    res.send(results);
    connection.release(); // 釋放連接
  }catch (error){
    console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
    res.send('無法連線');
    throw error;
  }finally{
      
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
      res.send('無法連線');
      throw error;
    }finally{
      connection.release(); // 釋放連接
    }

});

/*使用者認証*/
app.post("/createUser", async function(req, res) {
  const { username, password } = req.body;

  try {
    const cnDB = database.cnDB();
    const connection = await cnDB.getConnection(); 

    const sqlSearch = "SELECT * FROM Users WHERE username = ?";
    const [searchResults] = await connection.query(sqlSearch, [username]);
    console.log("------> Search Results");
    console.log(searchResults.length);

    if (searchResults.length !== 0) {
      console.log("------> User already exists");
      res.sendStatus(409); 
    } else {
      const sqlInsert = "INSERT INTO Users VALUES (0, ?, ?)";
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await connection.query(sqlInsert, [username, hashedPassword]);  
      console.log("--------> Created new User");
      console.log(result.insertId);
      res.sendStatus(201); 
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('無法連線'); 
  }finally{
    connection.release(); 
  }
});
