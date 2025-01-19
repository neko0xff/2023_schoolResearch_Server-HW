// deno-lint-ignore-file
/*相関函式庫*/
import httpServer from "../../modules/httpServer.js";
import clock from "../../modules/clock.js";

/*資料庫&後端*/
const app=httpServer.app();

// POST /webhook =>  webhook endpoint
app.post('/webhook', (req, res) => {
    const data = JSON.stringify(req.body);
    
    console.log(`[${clock.consoleTime()}] HTTP POST /webhook`);
    console.log(`[${clock.consoleTime()}] Received webhook: ${data}`);
    res.sendStatus(200);
});
