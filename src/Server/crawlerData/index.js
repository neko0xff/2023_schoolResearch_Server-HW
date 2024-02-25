function task_1(){
    const crawler_1 = require('./module/crawler_1.js');
    crawler_1.getData();
}

function task_2(){
    const crawler_2 = require('./module/crawler_2.js');
    crawler_2.getData();
}

function scheduleTask(){
   require('./module/schedule.js'); 
}

task_1();
task_2();
scheduleTask();