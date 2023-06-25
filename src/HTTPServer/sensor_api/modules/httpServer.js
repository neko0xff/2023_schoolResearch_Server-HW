var express = require('express');
const compression = require('compression');
const bodyparser = require("body-parser");
var clock=require('./clock.js');
var ConfigParser = require('configparser');
const configSet = new ConfigParser();
configSet.read('./modules/config/serviceSet.cfg');
configSet.sections();

/*Server 起始設定*/
var httpService=express();
var port=configSet.get('APIRouter','port'); 

httpService.listen(port,function(){
  console.log(`[${clock.consoleTime()}] API Server Started!`);
  console.log(`[${clock.consoleTime()}] API Server URL: http://[Server_IP]:%s`,port);
});

httpService.use(compression()); //啟用gzip壓縮
httpService.use(bodyparser.urlencoded({ extended: false }));
httpService.use(bodyparser.json());

function app(){
    return httpService;
}

module.exports={
    app:app,
};