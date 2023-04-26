/*相関函式庫*/
var express = require('express');
var bodyParser = require('body-parser');
const compression = require('compression');

/*時間*/
var clock=require('./modules/clock.js');
var date= clock.SQLDate();
var time= clock.SQLTime();

/*資料庫*/
var database=require('./modules/database.js');
var cnDB=null;

/*Server 起始設定*/
var app=express();
var port=3095;
var server = app.listen(port,function(){
   console.log(clock.consoleTime()+" : API Server is Start!");
   console.log(clock.consoleTime()+" : API Server URL: http://[Server_IP]:%s",port);
});

app.use(compression());

/*測試是否運行*/
app.get('/',function(req,res){
    res.send("API Server is running!");
    console.log(clock.consoleTime()+" : GET /");
});
app.get('/testDB', async function(req, res) {
    var cnSql = 'SELECT 1 + 1 AS solution';
    console.log(clock.consoleTime() + " : GET /testDB");
   
    try {
        var cnDB=database.cnDB();
        const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
        const [results, fields] = await connection.execute(cnSql); // 執行 SQL 查詢
        const dbValue = results[0].solution;
        const str = "The solution is: " + dbValue.toString();
        console.log(clock.consoleTime() + " : " + str);
        res.end(str);
        connection.release(); // 釋放連接
    } catch (error) {
        console.error('Failed to execute query: ' + error.message);
        res.end('無法連線');
        throw error;
    }
});

/*開發版上傳專用*/
//api: /upload/:deviceID/data? 
app.post('/upload/:deviceID/data', async function(req, res){
    var device_ID=req.params.deviceID;
    console.log(clock.consoleTime()+" : POST /upload/"+device_ID+"/data");

    //Query: ?hum=(num)&temp=(num)
    var hum=req.query.hum; 
    var temp=req.query.temp; 
    var tvoc=req.query.tvoc;
    var co=req.query.co;
    var co2=req.query.co2;
    var data="('"+hum+"','"+temp+"','"+tvoc+"','"+co+"','"+ co2+"','"+date+"','"+time+"');";
    var uploadSQL="INSERT INTO "+device_ID+"_Table(hum,temp,tvoc,co,co2,date,time) VALUES"+data;
    
    /*run*/
    try {
        var cnDB=database.cnDB();
        const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
        const [results, fields] = await connection.execute(uploadSQL); // 執行 SQL 查詢
        console.log(clock.consoleTime() + " : " + results);
        res.send(results);
        connection.release(); // 釋放連接
    } catch (error) {
        console.error('Failed to execute query: ' + error.message);
        res.send('無法連線');
        throw error;
    }
});
//api: /StatusGet/:deviceID/:switchID/powerStatus
app.get('/StatusGet/:deviceID/:switchID/powerStatus',async function(req,res){
  var device_ID = req.params.deviceID;
  var switch_ID = req.params.switchID;
  var statusSQL = "SELECT `status` FROM `"+device_ID+"_Status` WHERE `name`= '"+switch_ID+"';";
  console.log(clock.consoleTime()+" : GET /StatusGet/"+device_ID+"/"+switch_ID+"/powerStatus");
   
  try {
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
    const [results, fields] = await connection.execute(statusSQL); // 執行 SQL 查詢
    console.log(clock.consoleTime() + " : " + results);
    res.send(results);
    connection.release(); // 釋放連接
  } catch (error) {
    console.error('Failed to execute query: ' + error.message);
    res.send("無法連線");
    throw error;
  }

});

/*讀值*/
// api: /read/:deviceID
// 回傳格式: JSON
app.get('/read/:deviceID/hum', async function(req, res) {
    var device_ID = req.params.deviceID;
    var readSQL = 'SELECT hum,date,time FROM ' + device_ID + '_Table ORDER BY `date` AND `time` DESC LIMIT 1;';
    console.log(clock.consoleTime() + " : GET /read/" + device_ID + "/hum");
    
    try {
        var cnDB=database.cnDB();
        const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
        const [results, fields] = await connection.execute(readSQL); // 執行 SQL 查詢
        console.log(clock.consoleTime() + " : " + results);
        res.send(results);
        connection.release(); // 釋放連接
    } catch (error) {
        console.error('Failed to execute query: ' + error.message);
        res.send('無法連線');
        throw error;
    }
});
app.get('/read/:deviceID/temp', async function(req, res) {
    var device_ID = req.params.deviceID;
    var readSQL = 'SELECT temp,date,time FROM ' + device_ID + '_Table ORDER BY `date` AND `time` DESC LIMIT 1;';
    console.log(clock.consoleTime() + " : GET /read/" + device_ID + "/hum");
    
    try {
        var cnDB=database.cnDB();
        const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
        const [results, fields] = await connection.execute(readSQL); // 執行 SQL 查詢
        console.log(clock.consoleTime() + " : " + results);
        res.send(results);
        connection.release(); // 釋放連接
    } catch (error) {
        console.error('Failed to execute query: ' + error.message);
        res.send('無法連線');
        throw error;
    }
});

app.get('/read/:deviceID/tvoc',async function(req, res){
    var device_ID=req.params.deviceID;
    var readSQL='SELECT tvoc,date,time FROM '+ device_ID+'_Table ORDER BY `date` AND `time` DESC LIMIT 1;';
    console.log(clock.consoleTime()+" : GET /read/"+device_ID+"/tvoc");
    
    /*run*/
    try {
        var cnDB=database.cnDB();
        const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
        const [results, fields] = await connection.execute(readSQL); // 執行 SQL 查詢
        console.log(clock.consoleTime() + " : " + results);
        res.send(results);
        connection.release(); // 釋放連接
    } catch (error) {
        console.error('Failed to execute query: ' + error.message);
        res.send('無法連線');
        throw error;
    }
});
app.get('/read/:deviceID/co2',async function(req, res){
    var device_ID=req.params.deviceID;
    var readSQL='SELECT co2,date,time FROM '+ device_ID+'_Table ORDER BY `date` AND `time` DESC LIMIT 1;';
    console.log(clock.consoleTime()+" : GET /read/"+device_ID+"/co2");
    
    /*run*/
    try {
        var cnDB=database.cnDB();
        const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
        const [results, fields] = await connection.execute(readSQL); // 執行 SQL 查詢
        console.log(clock.consoleTime() + " : " + results);
        res.send(results);
        connection.release(); // 釋放連接
    } catch (error) {
        console.error('Failed to execute query: ' + error.message);
        res.send('無法連線');
        throw error;
    }
});
app.get('/read/:deviceID/co',async function(req, res){
    var device_ID=req.params.deviceID;
    var readSQL='SELECT co,date,time FROM '+ device_ID+'_Table ORDER BY `date` AND `time` DESC LIMIT 1;';
    console.log(clock.consoleTime()+" : GET /read/"+device_ID+"/co2");
    
    /*run*/
    try {
        var cnDB=database.cnDB();
        const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
        const [results, fields] = await connection.execute(readSQL); // 執行 SQL 查詢
        console.log(clock.consoleTime() + " : " + results);
        res.send(results);
        connection.release(); // 釋放連接
    } catch (error) {
        console.error('Failed to execute query: ' + error.message);
        res.send('無法連線');
        throw error;
    }
});

/*開関控制*/
app.get('/switchCtr/:deviceID/fan1', async function(req, res){
  const device_ID = req.params.deviceID;
  console.log(clock.consoleTime() + ' : GET /switchCtr/' + device_ID + '/fan1');
  
  // Query: ?
  const status = req.query.status;
  const updateSQL ="UPDATE `" + device_ID + "_Status` SET `status`= '" +status +"'  WHERE `"+ device_ID +"_Status`.`name`= 'fan1'";
  // UPDATE `Switch01_Status` SET `status`='0' WHERE `Switch01_Status`.`name`= 'fan1'
  var Recdata= "('fan1','"+ status +"','"+ date +"','"+ time +"')";
  const RecSQL = "INSERT INTO `"+ device_ID +"_StatusRec`(`switch`, `status`, `date`, `time`) VALUES " + Recdata;

  /*Update*/
  try{
      var cnDB=database.cnDB();
      const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
      const [results, fields] = await connection.execute(updateSQL); // 執行 SQL 查詢
      connection.release(); // 釋放連接
   } catch (error) {
      console.error('Failed to execute query: ' + error.message);
      res.send('無法連線');
      throw error;
   }

  /*Rec*/
  try{
    var cnDB=database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
    const [results, fields] = await connection.execute(RecSQL); // 執行 SQL 查詢
    connection.release(); // 釋放連接
  }catch (error){
    console.error('Failed to execute query: ' + error.message);
    res.send('無法連線');
    throw error;
  }

  /*status*/
  try {
    if (status == 1) {
      const statusStr = device_ID + ' is On!';
      console.log(clock.consoleTime() + ' : ' + statusStr);
      res.send(status);
    } else if (status == 0) {
      const statusStr = device_ID + ' is Off!';
      console.log(clock.consoleTime() + ' : ' + statusStr);
      res.send(status);
    }
  } catch (error) {
    console.log(error);
  }
});
app.get('/switchCtr/:deviceID/fan2', async function(req, res){
  const device_ID = req.params.deviceID;
  console.log(clock.consoleTime() + ' : GET /switchCtr/' + device_ID + '/fan2');

  // Query: ?
  const status = req.query.status;
  const updateSQL ="UPDATE `" + device_ID + "_Status` SET `status`= '" +status +"'  WHERE `"+ device_ID +"_Status`.`name`= 'fan2'";
  var Recdata= "('fan2','"+ status +"','"+ date +"','"+ time +"')";
  const RecSQL = "INSERT INTO `"+ device_ID +"_StatusRec`(`switch`, `status`, `date`, `time`) VALUES " + Recdata;
  
  /*Update*/
   try{
      var cnDB=database.cnDB();
      const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
      const [results, fields] = await connection.execute(updateSQL); // 執行 SQL 查詢
      connection.release(); // 釋放連接
    } catch (error) {
      console.error('Failed to execute query: ' + error.message);
      res.send('無法連線');
      throw error;
    }

    /*Rec*/
    try{
      var cnDB=database.cnDB();
      const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
      const [results, fields] = await connection.execute(RecSQL); // 執行 SQL 查詢
      connection.release(); // 釋放連接
    }catch (error){
     console.error('Failed to execute query: ' + error.message);
     res.send('無法連線');
     throw error;
    }

    /*status*/
    try {
      if (status == 1) {
        const statusStr = device_ID + ' is On!';
        console.log(clock.consoleTime() + ' : ' + statusStr);
        res.send(status);
      } else if (status == 0) {
        const statusStr = device_ID + ' is Off!';
        console.log(clock.consoleTime() + ' : ' + statusStr);
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
    console.log(clock.consoleTime()+" : GET /statusRec/"+device_ID+"/view");

    /*run*/
    try {
        var cnDB=database.cnDB();
        const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
        const [results, fields] = await connection.execute(viewSQL); // 執行 SQL 查詢
        console.log(clock.consoleTime() + " : " + results);
        res.send(results);
        connection.release(); // 釋放連接
    } catch (error) {
        console.error('Failed to execute query: ' + error.message);
        res.send('無法連線');
        throw error;
    }

});
