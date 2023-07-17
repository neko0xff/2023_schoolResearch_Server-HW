const cluster = require("cluster");
const os = require("os");
const cpus = os.cpus();
var clock = require("./modules/clock.js");

require("./rules/mqttPub.js"); //mqtt Pub

/*產生多個工作線程*/
async function startWorker(){
    const worker=cluster.fork();
    console.log(`[${clock.consoleTime()}] Cluster: Worker ${worker.id} Started`);
}

/*管理集群的狀態*/
if(cluster.isMaster){
    /*在各個核心線程上分配所需的工作*/
    cpus.forEach(startWorker);    
   
    /*工作線程斷線時*/
    cluster.on("disconnect",worker => console.log(
        `[${clock.consoleTime()}] Cluster: Worker ${worker.id} disconnect from the Cluster.`
    ));

    /*工作線程掛掉(退出)時*/
    cluster.on("exit", (worker,code,signal) => {
        console.log(`[${clock.consoleTime()}] Cluster: Worker ${worker.id} died&exit.`);
        console.log(`[${clock.consoleTime()}] code ${code} (${signal})`);
    });

    /*建立新的工作線程*/
    startWorker();
}else{
    require("./service.js");
}