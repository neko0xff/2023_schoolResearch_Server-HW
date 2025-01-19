/*相關函式庫*/
import crawler1 from "./crawler_1.js";
//import crawler2 from "./crawler_2.js";
import mqttRouter from"./mqtt/mqttPubRouter.js";
import clock from"./clock.js";


/*定義排程*/

// task1: 每天早上08點00分執行一回
function task1(){
  Deno.cron("Daily Data Collection", "0 8 * * *", () => {
      /*需排程的工作*/
      console.log(`[${clock.consoleTime()}] task is running in backend`);
      getALLdata();
      //MQTTPubUpdate();
  });
}

function getALLdata(){
  crawler1.getData();
  //crawler2.getData();
}

function MQTTPubUpdate(){
  mqttRouter.pubCrawlerAQIALL();
}

/*管理部分*/
function main(){
    task1();
}

const schedule = {
  main
}

export default schedule;