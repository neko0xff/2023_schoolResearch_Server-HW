import crawler_1 from "./module/crawler_1.js";
import crawler_2 from "./module/crawler_2.js";
import mqttRouter from "./module/mqtt/mqttPubRouter.js";
import task from "./module/schedule.js";

function task_1(){
    crawler_1.getData();
}

function task_2(){
    crawler_2.getData();
}

function task_3(){
    mqttRouter.pubCrawlerAQIALL();
}

function scheduleTask(){
   task.main();
}

function main(){
    task_1();
    //task_2();
    //task_3();
    scheduleTask();
}

main();
