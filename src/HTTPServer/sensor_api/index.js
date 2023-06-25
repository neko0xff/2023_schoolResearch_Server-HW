/*模組化啟用*/    
function loop1(){
    require('./modules/mqtt/mqttBroker.js'); //MQTT Broker
    require('./rules/httpAPI.js'); //HTTP api
}
function loop2(){
    require('./rules/mqttPub.js'); //mqtt Pub
}

/*主程式*/
loop1();
loop2();