/*戴入相闗模姐*/
var clock = require("./modules/clock.js");
function main(){
    require("./rules/router.js");
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
 