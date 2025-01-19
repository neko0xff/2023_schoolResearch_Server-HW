/*模組化啟用*/  
import httpAPI from "./rules/http/router.js"; //HTTP api
import mqttBroker from "./modules/mqtt/mqttBroker.js"; //MQTT Broker

/*呼叫內容*/
function startServer(){
    httpAPI;
    mqttBroker;
}

/*組成一個函式去呼叫*/

function main(){
    startServer()
};

main();
