/*相関函式庫*/
var express = require('express');
var bodyParser = require('body-parser');

/*時間*/
var clock=require('./modules/clock.js');

/*資料庫*/
var database=require('./modules/database.js');
var cnDB=null;

/*Server 起始設定*/
var app=express();
var port=3000;
var server = app.listen(port,function(){
   console.log(clock.consoleTime()+" : API Server is Start!");
   console.log(clock.consoleTime()+" : API Server URL: http://[Server_IP]:%s",port);
});

/*測試是否運行*/
app.get('/',function(req,res){
    res.send("API Server is running!");
    console.log(clock.consoleTime()+" : GET /");
});
app.get('/testDB',function(req,res){
    var cnSql='SELECT 1 + 1 AS solution';
    var output;
    console.log(clock.consoleTime()+" : GET /testDB");
    cnDB=database.cnDB();
    cnDB.connect();
    cnDB.query(cnSql, function (error, results, fields) {
        if(error)throw error;
        var dbValue = results[0].solution;
        var str= "The solution is: " + dbValue.toString();
        console.log(clock.consoleTime()+" : "+str);
        res.send(str);
    });
    cnDB.end();
})

/*開發版上傳專用*/
//api: /upload/:deviceID/data? 
app.post('/upload/:deviceID/data',async function(req, res){
    var device_ID=req.params.deviceID;
    console.log(clock.consoleTime()+" : POST /upload/"+device_ID+"/data");

    //Query: ?hum=(num)&temp=(num)
    var hum=req.query.hum; 
    var temp=req.query.temp; 
    var tvoc=req.query.tvoc;
    var co2=req.query.co2;
    var data="("+hum+","+temp+","+tvoc+","+ co2+");";
    var uploadSQL="INSERT INTO "+device_ID+"_Table(hum,temp,tvoc,co2) VALUES"+data;
    
    cnDB=database.cnDB();
    cnDB.connect();
    cnDB.query(uploadSQL, function (error, results, fields) {
        if(error)throw error;   
        var upload = device_ID +' is Update!';
        console.log(clock.consoleTime()+" : "+ upload);
        res.send(upload);
        cnDB.end();
    });
})

/*讀值*/
// api: /read/:deviceID
// 回傳格式: JSON
app.get('/read/'+':deviceID'+'/hum',function(req, res) {
    var device_ID=req.params.deviceID;
    var readSQL='SELECT hum FROM '+ device_ID+'_Table ORDER BY `date` AND `time` DESC LIMIT 1;';
    console.log(clock.consoleTime()+" : GET /read/"+device_ID+"/hum");
    
    cnDB=database.cnDB();
    cnDB.connect();
    cnDB.query(readSQL, function (error, results, fields) {
        if(error)throw error;
        var output = results;
        console.log(clock.consoleTime()+" : "+ JSON.stringify(output["hum"]));
        res.send(output);
        cnDB.end();
    });
});
app.get('/read/'+':deviceID'+'/temp',function(req, res){
    var device_ID=req.params.deviceID;
    var readSQL='SELECT temp FROM '+ device_ID+'_Table ORDER BY `date` AND `time` DESC LIMIT 1;';
    console.log(clock.consoleTime()+" : GET /read/"+device_ID+"/temp");
    
    cnDB=database.cnDB();
    cnDB.connect();
    cnDB.query(readSQL, function (error, results, fields) {
        if(error)throw error;
        var output = results;
        console.log(clock.consoleTime()+" : "+ output);
        res.send(output);
        cnDB.end();
    });
    
});
app.get('/read/'+':deviceID'+'/tvoc',function(req, res){
    var device_ID=req.params.deviceID;
    var readSQL='SELECT tvoc FROM '+ device_ID+'_Table ORDER BY `date` AND `time` DESC LIMIT 1;';
    console.log(clock.consoleTime()+" : GET /read/"+device_ID+"/tvoc");
    
    cnDB=database.cnDB();
    cnDB.connect();
    cnDB.query(readSQL, function (error, results, fields) {
        if(error)throw error;
        var output = results;
        console.log(clock.consoleTime()+" : "+ output);
        res.send(output);
        cnDB.end();
    }); 
});
app.get('/read/'+':deviceID'+'/co2',function(req, res){
    var device_ID=req.params.deviceID;
    var readSQL='SELECT co2 FROM '+ device_ID+'_Table ORDER BY `date` AND `time` DESC LIMIT 1;';
    console.log(clock.consoleTime()+" : GET /read/"+device_ID+"/co2");
    
    cnDB=database.cnDB();
    cnDB.connect();
    cnDB.query(readSQL, function (error, results, fields) {
        if(error)throw error;
        var output = results;
        console.log(clock.consoleTime()+" : "+ output);
        res.send(output);
        cnDB.end();
    });  
});