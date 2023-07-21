// 使用單線程部分
var service=require("./service.js");
var mqttPub=require("./rules/mqttPub.js"); //mqtt Pub

function main(){
   service;
   mqttPub;
}

/*主程式*/
try {
   main();
} catch(error) {
   console.log(`Error: ${error}`);
   throw error;
}finally {
   main();
}

