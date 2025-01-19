function task_1(){
    const crawler_1 = require('./module/crawler_1.js');
    crawler_1.getData();
}

function task_2(){
    const crawler_2 = require('./module/crawler_2.js');
    crawler_2.getData();
}

function task_3(){
    var mqttRouter= require("./module/mqtt/mqttPubRouter.js");
    mqttRouter.pubCrawlerAQIALL();
}

function scheduleTask(){
   require('./module/schedule.js'); 
}

function main(){
    task_1();
    //task_2();
    //task_3();
    scheduleTask();
}

main();
