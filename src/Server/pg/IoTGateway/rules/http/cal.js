/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */

/* 相關函式庫 */
const clock = require("../../modules/clock.js");
const httpServer = require("../../modules/httpServer.js");
const database = require("../../modules/database.js");

/* 資料庫 & 後端 */
const cnDB = null;
const app = httpServer.app();

/* 幫助函數 - 用於處理錯誤回應 */
function handleError(res, error, statusCode = 500) {
    console.error(`[${clock.consoleTime()}] Error: ${error.message}`);
    const responseMeta = { code: "-1", error: error.message };
    res.status(statusCode).send(responseMeta);
}

/* 計算碳足跡 */

// POST /cal/Cfoot/traffic => 計算交通排放量
// 接收格式：x-www-form-urlencoded
app.post("/cal/Cfoot/traffic", async function(req, res) {
    const { CPL, dist } = req.body;
    console.log(`[${clock.consoleTime()}] HTTP POST /cal/Cfoot/traffic`);

    if (!CPL || dist === undefined) {
        return handleError(res, new Error("Missing data in request"), 400);
    }

    try {
        const traffic = (CPL * dist).toFixed(2); // 公式 = 排放因數 * 旅行的距離
        const responseMeta = {
            code: "1",
            output: `${traffic} CO2e`,
            output_num: `${traffic}`,
            use_unit: "(單位)/CO2e"
        };
        res.send(responseMeta);
    } catch (error) {
        handleError(res, error);
    }
});

// POST /cal/Cfoot/traffic_db => 計算交通排放量 + 調用資料表
// 接收格式：x-www-form-urlencoded
app.post("/cal/Cfoot/traffic_db", async function(req, res) {
    const { CPL, dist } = req.body;
    const cnDB = database.cnDB();
    const connection = await cnDB.connect();  
    const searchSQL = `
        SELECT MAX(coe) as max_coe, unit 
        FROM sensordb.cfp_p_02 
        WHERE name = $1
        GROUP BY unit;
    `;

    console.log(`[${clock.consoleTime()}] HTTP POST /cal/Cfoot/traffic_db`);
    if (!CPL || dist === undefined) {
        return handleError(res, new Error("Missing data in request"), 400);
    }
    try {
        const results = await connection.query(searchSQL, [CPL]);
        if (!results.rows || results.rows.length === 0 || !results.rows[0].max_coe) {
            throw new Error("No emission factor found for the provided CPL.");
        }
        
        const coe = results.rows[0].max_coe;
        const unit = results.rows[0].unit;
        const traffic = (coe * dist).toFixed(2); // 公式 = 排放因數 * 旅行的距離
        
        const responseMeta = {
            code: "1",
            output: `${traffic} CO2e`,
            output_num: `${traffic}`,
            use_unit: `${unit}/CO2e`
        };
        res.send(responseMeta);
    } catch (error) {
        handleError(res, error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// POST /cal/Cfoot/other => 計算其它排放量
// 接收格式：x-www-form-urlencoded
app.post("/cal/Cfoot/other", async function(req, res) {
    const { total, gwp } = req.body;
    const data1 = 0.001102;

    console.log(`[${clock.consoleTime()}] HTTP POST /cal/Cfoot/other`);
    if (!total || gwp === undefined) {
        return handleError(res, new Error("Missing data in request"), 400);
    }
    try {
        const other = (total * data1 * gwp).toFixed(2); // 公式 = 總數量 * 0.001102 * GWP 排放因數
        const responseMeta = {
            code: "1",
            output: `${other} CO2e`,
            output_num: `${other}`,
            use_unit: "(單位)/CO2e"
        };
        res.send(responseMeta);
    } catch (error) {
        handleError(res, error);
    }
});

// POST /cal/Cfoot/other_db => 計算其它排放量 + 調用資料表
// 接收格式：x-www-form-urlencoded
app.post("/cal/Cfoot/other_db", async function(req, res) {
    const { total, gwp } = req.body;
    const cnDB = database.cnDB();
    const connection = await cnDB.connect();  
    const data1 = 0.001102;
    const searchSQL = `
        SELECT MAX(coe) as max_coe, unit 
        FROM sensordb.cfp_p_02 
        WHERE name = $1 
        GROUP BY unit
        ORDER BY max_coe DESC 
        LIMIT 1;
    `;

    console.log(`[${clock.consoleTime()}] HTTP POST /cal/Cfoot/other_db`);
    if (!total || gwp === undefined) {
        return handleError(res, new Error("Missing data in request"), 400);
    }
    try {
        const results = await connection.query(searchSQL, [gwp]);
        if (!results.rows || results.rows.length === 0 || !results.rows[0].max_coe) {
            throw new Error("No emission factor found for the provided GWP.");
        }

        const coe = results.rows[0].max_coe;
        const unit = results.rows[0].unit;
        const other = (total * data1 * coe).toFixed(2); // 公式 = 總數量 * 0.001102 * GWP 排放因數

        const responseMeta = {
            code: "1",
            output: `${other} CO2e`,
            output_num: `${other}`,
            use_unit: `${unit}/CO2e`
        };
        res.send(responseMeta);
    } catch (error) {
        handleError(res, error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// POST /cal/CBAM/emissions => 計算排放量
// 接收格式：x-www-form-urlencoded
app.post("/cal/CBAM/emissions", async function(req, res) {
    const { use, GWP } = req.body;

    console.log(`[${clock.consoleTime()}] HTTP POST /cal/CBAM/emissions`);

    if (!use || GWP === undefined) {
        return handleError(res, new Error("Missing data in request"), 400);
    }

    try {
        const emissions = (use * GWP).toFixed(2); // 排放量 = 使用量 * 排放因數
        const responseMeta = {
            code: "1",
            output: `${emissions} CO2e`,
            output_num: `${emissions}`,
            use_unit: "(單位)/CO2e"
        };
        res.send(responseMeta);
    } catch (error) {
        handleError(res, error);
    }
});

// POST /cal/CBAM/emissions_db => 計算排放量 + 調用資料表
// 接收格式：x-www-form-urlencoded
app.post("/cal/CBAM/emissions_db", async function(req, res) {
    const { use, gwp } = req.body;
    const cnDB = database.cnDB();
    const connection = await cnDB.connect();  
    const searchSQL = `
        SELECT MAX(coe) as max_coe, unit
        FROM sensordb.cfp_p_02
        WHERE name = $1
        GROUP BY unit;
    `;

    console.log(`[${clock.consoleTime()}] HTTP POST /cal/CBAM/emissions_db`);
    if (!use || gwp === undefined) {
        return handleError(res, new Error("Missing data in request"), 400);
    }

    try {
        const results = await connection.query(searchSQL, [gwp]);

        if (!results.rows || results.rows.length === 0 || !results.rows[0].max_coe) {
            throw new Error("No emission factor found for the provided GWP.");
        }
        const coe = results.rows[0].max_coe;
        const unit = results.rows[0].unit;
        const emissions = (use * coe).toFixed(2); // 排放量 = 使用量 * 排放因數
        const responseMeta = {
            code: "1",
            output: `${emissions} CO2e`,
            output_num: `${emissions}`,
            use_unit: `${unit}/CO2e`
        };
        
        res.send(responseMeta);
    } catch (error) {
        handleError(res, error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// POST /cal/CBAM/CC_simple => 計算碳含量_簡單與中間產品
// 接收格式：x-www-form-urlencoded
app.post("/cal/CBAM/CC_simple", async function(req, res) {
    const { emissions, production } = req.body;

    console.log(`[${clock.consoleTime()}] HTTP POST /cal/CBAM/CC_simple`);
    if (!emissions || production === undefined) {
        return handleError(res, new Error("Missing data in request"), 400);
    }
    try {
        const CC_simple = (emissions * production).toFixed(2); // 碳含量 = 排放量 * 產量
        const responseMeta = {
            code: "1",
            output: `${CC_simple} CO2e`,
            output_num: `${CC_simple}`,
            use_unit: "(單位)/CO2e"
        };
        res.send(responseMeta);
    } catch (error) {
        handleError(res, error);
    }
});
