import clock from "./modules/clock.js";
import router from "./rules/router.js";

/*戴入相闗模組*/
function main(){
    router.main();
}

/*主程式*/
console.log(`[${clock.consoleTime()}] Service is Starting.....`);
try {
    main();
 } catch(error) {
    console.log(`Error: ${error}`);
    throw error;
 }finally {
    main();
 }
 