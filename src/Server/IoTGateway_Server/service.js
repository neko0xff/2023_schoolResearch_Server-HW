/*模組化啟用*/  
var httpAPI=require("./rules/httpAPI.js"); //HTTP api
var mqttBroker=require("./modules/mqtt/mqttBroker.js"); //MQTT Broker
function startServer(){
    httpAPI;
    mqttBroker;
}

if(require.main === module){
    startServer();
}else{
    module.exports= startServer;
}
