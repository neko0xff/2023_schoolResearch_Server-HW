/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */

/*相関函式庫*/
var clock=require("../../modules/clock.js");
var httpServer=require("../../modules/httpServer.js");

/*後端*/
var app=httpServer.app();

// POST /webhook =>  webhook endpoint
app.post('/webhook', (req, res) => {
    var data = JSON.stringify(req.body);
    
    console.log(`[${clock.consoleTime()}] HTTP POST /webhook`);
    console.log(`[${clock.consoleTime()}] Received webhook: ${data}`);
    res.sendStatus(200);
});
