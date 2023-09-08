const swaggerAutogen = require("swagger-autogen")();
const outputFile = "./modules/config/swagger.json"; // 輸出的生成結果
const file1="./rules/crawler.js";
const file2="./rules/sensor.js";
const file3="./rules/test.js";
const file4="./rules/users.js";
const file5="./rules/switch.js";
const file6="./rules/customValue.js";
const file7="./rules/mqttPub.js";
const endpointsFiles = [file1,file2,file3,file4,file5,file6,file7]; //要轉換的API程式

/*swaggerAutogen 的方法*/
swaggerAutogen(outputFile, endpointsFiles); 