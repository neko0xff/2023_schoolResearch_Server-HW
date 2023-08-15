const cron = require('node-cron');
const clock = require("./clock.js");
const crawler = require("./crawler.js");

/*定義排程*/

// task1: 每天07點00分執行一回
function task1(){
  cron.schedule('0 7 * * *', () => {
    console.log(`[${clock.consoleTime()}] task is running`);
    crawler.getData();
  });
}

/*管理部分*/
function main(){
    task1();
}

main();