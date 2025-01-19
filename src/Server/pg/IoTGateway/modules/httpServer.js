// deno-lint-ignore-file
/*相関函式庫*/
import bodyParser from "body-parser";
import RateLimit from"express-rate-limit";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";
import cors from "cors";
import express from "express";
import compression from "compression";
import ConfigParser from "configparser";
import swaggerDocument from"./config/swagger.json" with { type: "json" };
import clock from "./clock.js";

/*限制使用者存取的時間*/
const limiter = RateLimit({
    windowMs: 1*60*1000, // 1 minutes
    max: 100, // limit each IP to 100 requests per window Ms
});

/* 配置檔案讀取 */
const configSet = new ConfigParser();
configSet.read("./modules/config/serviceSet.cfg");
configSet.sections();
const port=configSet.get("Service","HTTP"); 
const mqtt=configSet.get("Service","MQTT");

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

/* Http Server */
const httpservice=express();
  
/*啟用時使用的設定*/
httpservice.use(limiter); //啟用限流
httpservice.use(compression()); //啟用gzip壓縮
httpservice.use(express.urlencoded({ extended: false })); 
httpservice.use(express.json()); //傳送方式：json
httpservice.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); //API Docs
httpservice.use(bodyParser.json());
httpservice.use(function(_req, res, next) {
    // 允許部分header
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/*安全性部分*/
httpservice.use(helmet()); 
httpservice.use(cors(corsOptions));
httpservice.disable("x-powered-by"); //關閉X-Powered-By 標頭

/*通訊埠監聽*/
httpservice.listen(port,function(){
    console.log(`[${clock.consoleTime()}] HTTP API Server Started!`);
    console.log(`[${clock.consoleTime()}] HTTP API Server URL: http://[Server_IP]:${port}`);
});

function app(){
    return httpservice;
}

const httpServer = {
    app
}

export default httpServer;