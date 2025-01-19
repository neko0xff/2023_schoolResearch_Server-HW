/*相關函式庫*/
const swaggerAutogen = require("swagger-autogen")();

/*規則*/
const file1="./rules/http/crawler.js";
const file2="./rules/http/sensor.js";
const file3="./rules/http/test.js";
const file4="./rules/http/users.js";
const file5="./rules/http/switch.js";
const file6="./rules/http/customValue.js";
const file7="./rules/http/users.js";
const file8="./rules/http/web.js";
const file9="./rules/http/cal.js";
const file10='./rules/http/auth.js';

/*文件內部的相關說明*/
const doc = {
    info: {
        "version": "1.0.5",
        "title": "REST API Test Docs",
        "description": "該文件可提供在該專案中所需提供的功能"
    },
    host: 'localhost:3095',
    basePath: "/",
    schemes: [
       "http"
    ],
};

/*輸出對應文件*/
const endpointsFiles = [file1,file2,file3,file4,file5,file6,file7,file8,file9,file10]; //要轉換的API路由
const outputFile = "./modules/config/swagger.json"; // 輸出的生成結果
swaggerAutogen(outputFile, endpointsFiles,doc); 