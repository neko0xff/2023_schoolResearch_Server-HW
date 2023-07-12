const cluster = require("cluster");
const os = require("os");
var clock = require("./modules/clock.js");
const cpus = os.cpus();

require("./rules/mqttPub.js"); //mqtt Pub

async function startWorker(){
    const worker=cluster.fork();
    console.log(`[${clock.consoleTime()}] Cluster: Worker ${worker.id} Started`);
}

if(cluster.isMaster){
    cpus.forEach(startWorker);    
   
    /*If Worker disconnect*/
    cluster.on("disconnect",worker => console.log(
        `[${clock.consoleTime()}] Cluster: Worker ${worker.id} disconnect from the Cluster.`
    ));

    /*If Worker died(exit) =>  Create New Worker*/
    cluster.on("exit", (worker,code,signal) => {
        console.log(`[${clock.consoleTime()}] Cluster: Worker ${worker.id} died&exit.`);
        console.log(`[${clock.consoleTime()}] code ${code} (${signal})`);
    });
    startWorker();
}else{
    require("./service.js");
}