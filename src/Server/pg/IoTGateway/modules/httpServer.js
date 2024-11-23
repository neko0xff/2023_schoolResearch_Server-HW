/*相関函式庫*/
const bodyParser = require('body-parser');
var RateLimit = require('express-rate-limit');
var swaggerUi = require("swagger-ui-express");
var helmet = require("helmet");
var cors = require('cors');
var express = require("express");
var httpServer=express();
const compression = require("compression");
var ConfigParser = require("configparser");
const swaggerDocument = require("./config/swagger.json");
var clock=require("./clock.js");

/*限制使用者存取的時間*/
var limiter = RateLimit({
    windowMs: 1*60*1000, // 1 minutes
    max: 100, // limit each IP to 100 requests per window Ms
});

/* 配置檔案讀取 */
const configSet = new ConfigParser();
configSet.read("./modules/config/serviceSet.cfg");
configSet.sections();
var port=configSet.get("Service","HTTP"); 
var mqtt=configSet.get("Service","MQTT");

/*CORS設定*/
const corsOptions ={
    "origin": [
        "*",
        `http://localhost:${port}`,
        `http://localhost:${mqtt}`
    ],
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "allowedHeaders": ['Content-Type', 'Authorization'],
    "optionsSuccessStatus": 204
}
  
/*啟用時使用的設定*/
httpServer.use(limiter); //啟用限流
httpServer.use(compression()); //啟用gzip壓縮
httpServer.use(express.urlencoded({ extended: false })); 
httpServer.use(express.json()); //傳送方式：json
httpServer.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); //API Docs
httpServer.use(bodyParser.json());
httpServer.use(function(req, res, next) {
    // 允許部分header
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/*安全性部分*/
httpServer.use(helmet()); 
httpServer.use(cors(corsOptions));
httpServer.disable("x-powered-by"); //關閉X-Powered-By 標頭

/*通訊埠監聽*/
httpServer.listen(port,function(){
    console.log(`[${clock.consoleTime()}] HTTP API Server Started!`);
    console.log(`[${clock.consoleTime()}] HTTP API Server URL: http://[Server_IP]:${port}`);
});

function app(){
    return httpServer;
}

module.exports={
    app:app,
};