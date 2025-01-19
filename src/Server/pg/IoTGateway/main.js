// 使用單線程部分
import * as service from "./service.js";
import * as mqttPub from"./rules/mqtt/Pubtopic.js";

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

