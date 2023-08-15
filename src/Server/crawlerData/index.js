function start(){
    const crawler = require('./module/crawler.js');
    crawler.getData();
}

function scheduleTask(){
   require('./module/schedule.js'); 
}

start();
scheduleTask();