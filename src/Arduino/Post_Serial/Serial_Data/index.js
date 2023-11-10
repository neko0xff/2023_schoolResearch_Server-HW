// 使用單線程部分
var service=require("./modules/serial.js");

function main(){
    service;
}

/*主程式*/
try {
    main();
} catch(error) {
    console.log(`Error: ${error}`);
    throw error;
}finally {
    main();
}
 