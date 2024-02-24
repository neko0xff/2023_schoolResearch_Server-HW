/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */

/*相関函式庫*/
var clock=require("../modules/clock.js");
var httpServer=require("../modules/httpServer.js");
var database=require("../modules/database.js");

/*資料庫&後端*/
var cnDB=null;
var app=httpServer.app();

/*計算碳足跡*/
//POST /cal/Cfoot/traffic => 交通
//接收格式：x-www-form-urlencoded
app.post("/cal/Cfoot/traffic", async function(req, res){
    const {CPL,dist} = req.body;
    var traffic;
    console.log(`[${clock.consoleTime()}] HTTP POST /cal/Cfoot/traffic`);
    
    if (!CPL || dist === undefined) {
        // 檢查是否有缺少必要的資料
        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        const responseMeta = { code: "-1", error: "Missing data in request" };
        return res.status(400).send(responseMeta);
    }

    /*進行計算*/
    try{
        traffic=(CPL*dist).toFixed(2); //公式= 排放因數 * 旅行的距離
        const responseMeta = {
            code: "0",
            output: `${traffic} Coe`,
            output_num: `${traffic}`,
            use_unit: `(單位)/CO2e`
        };
        res.send(responseMeta);
    }catch{
        console.log(`[${clock.consoleTime()}] Error `);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    }finally{

    }
     
});

//POST /cal/Cfoot/traffic_db => 交通+調用資料表
//接收格式：x-www-form-urlencoded
app.post("/cal/Cfoot/traffic_db", async function(req, res){
    const {CPL, dist} = req.body;
    var traffic;
    console.log(`[${clock.consoleTime()}] HTTP POST /cal/Cfoot/traffic_db`);

    if (!CPL || dist === undefined) {
        // 檢查是否有缺少必要的資料
        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        const responseMeta = { code: "-1", error: "Missing data in request" };
        return res.status(400).send(responseMeta);
    }

    var searchSQL = `SELECT Max(coe),unit FROM CFP_P_02 WHERE name = ? ORDER BY coe DESC LIMIT 1;`;
    var cnDB = database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
    
    /*進行計算*/
    try {
        var results = await connection.query(searchSQL,[CPL], { cache: false }); // 執行 SQL 查詢
        var coe = results[0][0]['Max(coe)'];
        var unit = results[0][0]['unit'];
        traffic = (coe * dist).toFixed(2); //公式= 排放因數 * 旅行的距離
        
        var responseMeta = {
            code: "0",
            output: `${traffic} CO2e`,
            output_num: `${traffic}`,
            use_unit: `${unit}/CO2e`
        };
        res.send(responseMeta);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    } finally {
        connection.release(); // 釋放連接
    }

});


//POST /cal/Cfoot/other => 其它
//接收格式：x-www-form-urlencoded
app.post("/cal/Cfoot/other", async function(req, res){
    const {total,gwp} = req.body;
    const data1=0.001102;
    var other;
    console.log(`[${clock.consoleTime()}] HTTP POST /cal/Cfoot/other`);
    
    if (!total || gwp === undefined) {
        // 檢查是否有缺少必要的資料
        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        const responseMeta = { code: "-1", error: "Missing data in request" };
        return res.status(400).send(responseMeta);
    }

    /*進行計算*/
    try{
        other=(total*data1*gwp).toFixed(2); //公式= 總數量 * 0.001102 * GWP 排放因數
        const responseMeta = {
            code: "0",
            output: `${other} CO2e`,
            output_num: `${other}`,
            use_unit: `(單位)/CO2e`
        };
        res.send(responseMeta);
    }catch{
        console.log(`[${clock.consoleTime()}] Error`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    }finally{

    }
     
});

//POST /cal/Cfoot/other_db => 交通+調用資料表
//接收格式：x-www-form-urlencoded
app.post("/cal/Cfoot/other_db", async function(req, res){
    const {total,gwp} = req.body;
    const data1=0.001102;
    var other;
    console.log(`[${clock.consoleTime()}] HTTP POST /cal/Cfoot/other_db`);

    if (!gwp || total === undefined) {
        // 檢查是否有缺少必要的資料
        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        const responseMeta = { code: "-1", error: "Missing data in request" };
        return res.status(400).send(responseMeta);
    }

    var searchSQL = `SELECT Max(coe),unit FROM CFP_P_02 WHERE name = ? ORDER BY coe DESC LIMIT 1;`;
    var cnDB = database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    /*進行計算*/
    try {
        var results = await connection.query(searchSQL,[gwp], { cache: false }); // 執行 SQL 查詢
        var coe = results[0][0]['Max(coe)'];
        var unit = results[0][0]['unit'];
        other=(total*data1*coe).toFixed(2); //公式= 總數量 * 0.001102 * GWP 排放因數
        var responseMeta = {
            code: "0",
            output: `${other} CO2e`,
            output_num: `${other}`,
            use_unit: `${unit}/CO2e`
        };
        res.send(responseMeta);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    } finally {
        connection.release(); // 釋放連接
    }

});

/*CBAM*/
//POST /cal/CBAM/emissions => 排放量
//接收格式：x-www-form-urlencoded
app.post("/cal/CBAM/emissions", async function(req, res){
    const {use,GWP} = req.body;
    var emissions;
    console.log(`[${clock.consoleTime()}] HTTP POST /cal/CBAM/emissions`);
    
    if (!gwp || use === undefined) {
        // 檢查是否有缺少必要的資料
        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        const responseMeta = { code: "-1", error: "Missing data in request" };
        return res.status(400).send(responseMeta);
    }

    /*進行計算*/
    try{
        emissions=(use*GWP).toFixed(2); //排放量= 使用量*排放因數
        const responseMeta = {
            code: "0",
            output: `${emissions} CO2e`,
            output_num: `${emissions}`,
            use_unit: `(單位)/CO2e`
        };
        res.send(responseMeta);
    }catch{
        console.log(`[${clock.consoleTime()}] Error`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    }finally{

    }
     
});

//POST /cal/CBAM/emissions_db => 排放量+調用資料表
//接收格式：x-www-form-urlencoded
app.post("/cal/CBAM/emissions_db", async function(req, res){
    const {use,gwp} = req.body;
    var emissions;
    console.log(`[${clock.consoleTime()}] HTTP POST /cal/CBAM/emissions`);

    if (!gwp || use === undefined) {
        // 檢查是否有缺少必要的資料
        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        const responseMeta = { code: "-1", error: "Missing data in request" };
        return res.status(400).send(responseMeta);
    }

    var searchSQL = `SELECT Max(coe),unit FROM CFP_P_02 WHERE name = ? ORDER BY coe DESC LIMIT 1;`;
    var cnDB = database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    /*進行計算*/
    try {
        var results = await connection.query(searchSQL,[gwp], { cache: false }); // 執行 SQL 查詢
        var coe = results[0][0]['Max(coe)'];
        var unit = results[0][0]['unit'];
        emissions=(use*coe).toFixed(2); //排放量= 使用量*排放因數
        const responseMeta = {
            code: "0",
            output: `${emissions} CO2e`,
            output_num: `${emissions}`,
            use_unit: `${unit}/CO2e`
        };
        res.send(responseMeta);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to execute query: ${error.message}`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    } finally {
        connection.release(); // 釋放連接
    }

});

//POST /cal/CBAM/CC_simple => 碳含量_簡單與中間產品
//接收格式：x-www-form-urlencoded
app.post("/cal/CBAM/CC_simple", async function(req, res){
    const {emissions,production} = req.body;
    var CC_simple;
    console.log(`[${clock.consoleTime()}] HTTP POST /cal/CBAM/CC_simple`);
    
    if (!emissions || production === undefined) {
        // 檢查是否有缺少必要的資料
        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        const responseMeta = { code: "-1", error: "Missing data in request" };
        return res.status(400).send(responseMeta);
    }

    /*進行計算*/
    try{
        CC_simple=(emissions/production).toFixed(2); //產品碳含量= 排放量/產品活動數據(生產量)
        const responseMeta = {
            code: "0",
            output: `${CC_simple} CO2e`,
            output_num: `${CC_simple}`,
            use_unit: `(單位)/CO2e`
        };
        res.send(responseMeta);
    }catch{
        console.log(`[${clock.consoleTime()}] Error`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    }finally{

    }
     
});

//POST /cal/CBAM/CC_simple_db => 碳含量_簡單與中間產品
//接收格式：x-www-form-urlencoded
app.post("/cal/CBAM/CC_simple_db", async function(req, res){
    const {use,gwp,production} = req.body;
    var CC_simple,emissions;
    console.log(`[${clock.consoleTime()}] HTTP POST /cal/CBAM/CC_simple_db`);
    
    if (!gwp || use === undefined) {
        // 檢查是否有缺少必要的資料
        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        const responseMeta = { code: "-1", error: "Missing data in request" };
        return res.status(400).send(responseMeta);
    }

    var searchSQL = `SELECT Max(coe),unit FROM CFP_P_02 WHERE name = ? ORDER BY coe DESC LIMIT 1;`;
    var cnDB = database.cnDB();
    const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接

    /*進行計算*/
    try{
        var results = await connection.query(searchSQL,[gwp], { cache: false }); // 執行 SQL 查詢
        var coe = results[0][0]['Max(coe)'];
        var unit = results[0][0]['unit'];
        emissions=use*coe; //排放量= 使用量*排放因數
        CC_simple=(emissions/production).toFixed(2); //產品碳含量= 排放量/產品活動數據(生產量)
        const responseMeta = {
            code: "0",
            output: `${CC_simple} CO2e`,
            output_num: `${CC_simple}`,
            use_unit: `${unit}/CO2e`
        };
        res.send(responseMeta);
    }catch{
        console.log(`[${clock.consoleTime()}] Error`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    }finally{
        connection.release(); // 釋放連接
    }
     
});

//POST /cal/CBAM/CC_CoPS => 碳含量_複雜產品
//接收格式：x-www-form-urlencoded
app.post("/cal/CBAM/CC_CoPS", async function(req, res){
    const {emissions,production,Mid_production,CC} = req.body;
    var CC_simple,CC_CoPS;
    console.log(`[${clock.consoleTime()}] HTTP POST /cal/CBAM/CC_CoPS`);
    
    /*進行計算*/
    try{
        CC_simple=emissions/production; //特定產品碳含量= 排放量/產品活動數據(生產量)
        CC_CoPS=(CC_simple+((Mid_production/production)*CC)).toFixed(2); //複雜產品=特定產品碳含量+((中間產品活動數據/產品活動數據)*中間產品碳含量)
        const responseMeta = {
            code: "0",
            output: `${CC_CoPS} CO2e`,
            output_num: `${CC_CoPS}`,
            use_unit: `(單位)/CO2e`
        };
        res.send(responseMeta);
    }catch{
        console.log(`[${clock.consoleTime()}] Error`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    }finally{

    }
     
});
