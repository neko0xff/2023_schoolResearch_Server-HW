/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */

/*相関函式庫*/
var clock=require("../modules/clock.js");
var httpServer=require("../modules/httpServer.js");

/*後端*/
var app=httpServer.app();

/*計算碳足跡*/
//POST /cal/Cfoot/traffic => 交通
//接收格式：x-www-form-urlencoded
app.post("/cal/Cfoot/traffic", async function(req, res){
    const {CPL,dist} = req.body;
    var traffic_other;
    console.log(`[${clock.consoleTime()}] HTTP POST /cal/Cfoot/traffic`);
    
    /*進行計算*/
    try{
        traffic_other=CPL*dist; //公式= 排放因數 * 旅行的距離
        const responseMeta = {
            code: "0",
            output: `${traffic_other}`
        };
        res.send(responseMeta);
    }catch{
        console.log(`[${clock.consoleTime()}] Error `);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    }finally{

    }
     
});

//POST /cal/Cfoot/other => 其它
//接收格式：x-www-form-urlencoded
app.post("/cal/Cfoot/other", async function(req, res){
    const {total,gwp} = req.body;
    const data1=0.001102;
    var other;
    console.log(`[${clock.consoleTime()}] HTTP POST /cal/Cfoot/other`);
    
    /*進行計算*/
    try{
        other=total*data1*gwp; //公式= 總數量 * 0.001102 * GWP 排放因數
        const responseMeta = {
            code: "0",
            output: `${other}`
        };
        res.send(responseMeta);
    }catch{
        console.log(`[${clock.consoleTime()}] Error`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    }finally{

    }
     
});

/*CBAM*/
//POST /cal/CBAM/emissions => 排放量
//接收格式：x-www-form-urlencoded
app.post("/cal/CBAM/emissions", async function(req, res){
    const {use,GWP} = req.body;
    var emissions;
    console.log(`[${clock.consoleTime()}] HTTP POST /cal/CBAM/emissions`);
    
    /*進行計算*/
    try{
        emissions=use*GWP; //排放量= 使用量*排放因數
        const responseMeta = {
            code: "0",
            output: `${emissions}`
        };
        res.send(responseMeta);
    }catch{
        console.log(`[${clock.consoleTime()}] Error`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    }finally{

    }
     
});

//POST /cal/CBAM/CC_simple => 碳含量_簡單與中間產品
//接收格式：x-www-form-urlencoded
app.post("/cal/CBAM/CC_simple", async function(req, res){
    const {emissions,production} = req.body;
    var CC_simple;
    console.log(`[${clock.consoleTime()}] HTTP POST /cal/CBAM/CC_simple`);
    
    /*進行計算*/
    try{
        CC_simple=emissions/production; //產品碳含量= 排放量/產品活動數據(生產量)
        const responseMeta = {
            code: "0",
            output: `${CC_simple}`
        };
        res.send(responseMeta);
    }catch{
        console.log(`[${clock.consoleTime()}] Error`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    }finally{

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
        CC_CoPS=CC_simple+((Mid_production/production)*CC); //複雜產品=特定產品碳含量+((中間產品活動數據/產品活動數據)*中間產品碳含量)
        const responseMeta = {
            code: "0",
            output: `${CC_CoPS}`
        };
        res.send(responseMeta);
    }catch{
        console.log(`[${clock.consoleTime()}] Error`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    }finally{

    }
     
});
