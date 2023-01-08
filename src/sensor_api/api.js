/*相関函式庫*/
var express = require('express');
var bodyParser = require('body-parser');
var clock=require('./modules/clock.js');
var port=3000;

/*Server 起始設定*/
var app=express();
var server = app.listen(port,function(){
   console.log("API Server is Start!");
   console.log("API Server URL: http://[Server_IP]:%s",port);
});

/*測試是否運行*/
app.get('/',function(req,res){
    res.send("API Server is running!");
    console.log(clock.consoleTime()+" : GET /");
});

/*開發版上傳專用*/
//api: /upload/:deviceID/data? 
app.post('/upload/:deviceID/data',async function(req, res){
    var device_ID=req.params.deviceID;
    //Query: ?hum=(num)&temp=(num)
    var hum=req.query.hum; 
    var temp=req.query.temp; 
    var tvoc=req.query.tvoc;
    var co2=req.query.co2;

    res.send(device_ID +' is Update!');
    console.log(clock.consoleTime()+" : POST /upload/"+device_ID+"/data");
})

/*讀值*/
// api: /read/:deviceID
app.get('/read/'+':deviceID'+'/hum',function(req, res) {
    var device_ID=req.params.deviceID;
    var hum=0;
    res.write(hum.toString());
    res.end();
    console.log(clock.consoleTime()+" : GET /read/"+device_ID+"/hum");
});
app.get('/read/'+':deviceID'+'/temp',function(req, res){
    var device_ID=req.params.deviceID;
    var temp=0;
    res.send(temp.toString());
    res.end();
    console.log(clock.consoleTime()+" : GET /read/"+device_ID+"/temp");
});
app.get('/read/'+':deviceID'+'/tvoc',function(req, res){
    var device_ID=req.params.deviceID;
    var tvoc=0;
    res.send(tvoc.toString());
    res.end();
    console.log(clock.consoleTime()+" : GET /read/"+device_ID+"/tvoc");
});
app.get('/read/'+':deviceID'+'/co2',function(req, res){
    var device_ID=req.params.deviceID;
    var co2=0;
    res.send(co2.toString());
    res.end();
    console.log(clock.consoleTime()+" : GET /read/"+device_ID+"/co2");
});