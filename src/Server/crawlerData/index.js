function task_1(){
    const crawler_1 = require('./module/crawler_1.js');
    crawler_1.getData();
}

function scheduleTask(){
   require('./module/schedule.js'); 
}

task_1();
scheduleTask();