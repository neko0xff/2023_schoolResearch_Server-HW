/*相關函式庫*/
const cron = require('node-cron');
const clock = require("./clock.js");
const crawler1 = require("./crawler_1.js");
const crawler2 = require("./crawler_2.js");

/*定義排程*/

// task1: 每天早上08點00分執行一回
function task1(){
  cron.schedule('0 8 * * *', () => {
    /*需排程的工作*/
    console.log(`[${clock.consoleTime()}] task is running in backend`);
    getALLdata();
  });
}

function getALLdata(){
  crawler1.getData();
  crawler2.getData();
}

/*管理部分*/
function main(){
    task1();
}

main();