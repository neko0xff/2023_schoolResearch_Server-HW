/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
/*相関函式庫*/
var bcrypt=require("bcrypt");
var clock=require("../modules/clock.js");
var httpServer=require("../modules/httpServer.js");
var database=require("../modules/database.js");
const ExpressBrute = require('express-brute'); 
const store = new ExpressBrute.MemoryStore();
const bruteforce = new ExpressBrute(store); 

/*資料庫*/
var cnDB=null;
var app=httpServer.app();

/*使用者認証*/

//POST /CreateUser => 建立使用者
//接收格式：x-www-form-urlencoded
app.post("/CreateUser", async function(req, res) {
    const {username, password, LoginName } = req.body;
    var salt = 10;
    const hashedPassword = bcrypt.hashSync(password, salt);
    const searchSQL = `SELECT username,LoginName,password FROM Users WHERE username = '${username}'`;
    var userData = `('${username}','${hashedPassword}','${LoginName}')`;
    var addUserSQL = `INSERT INTO Users (username, password, LoginName) VALUES ${userData}`;
  
    const cnDB = database.cnDB(); 
    const connection = await cnDB.getConnection();
  
    /*檢查使用者是否存在資料庫，若無則直接建立*/
    console.log(`[${clock.consoleTime()}] HTTP POST /CreateUser`);
    try {  
        const [results] = await connection.execute(searchSQL);
        if (results.length !== 0) {
            connection.release();
            console.log(`[${clock.consoleTime()}] ${username} already created!`);
            const responseMeta = {code: "0"};
            res.send(responseMeta);
        } else {
            await connection.execute(addUserSQL);
            console.log(`[${clock.consoleTime()}] ${username} created successfully`);
            const responseMeta = {code: "1"};
            res.send(responseMeta);
        }
    } catch (error) {  
        console.log(`[${clock.consoleTime()}] Error creating ${username}`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    } finally {
        connection.release();
    }
});

//POST /UpdateUserData => 改變使用者相關資料
//接收格式：x-www-form-urlencoded
app.post("/UpdateUserData", async function(req, res) {
    const {username, password, LoginName } = req.body;
    var salt = 10;
    const hashedPassword = bcrypt.hashSync(password, salt);
    const searchSQL = `SELECT username,LoginName,password FROM Users WHERE username = '${username}'`;
    var UPDATEUserSQL = `UPDATE Users SET password='${hashedPassword}',LoginName='${LoginName}' WHERE username='${username}';`;
  
    const cnDB = database.cnDB(); 
    const connection = await cnDB.getConnection();
  
    /*檢查使用者是否存在資料庫，若無則直接改變*/
    console.log(`[${clock.consoleTime()}] HTTP POST /UpdateUserData`);
    try {  
        const [results] = await connection.execute(searchSQL);
        if (results.length !== 0) {
            await connection.execute(UPDATEUserSQL);
            console.log(`[${clock.consoleTime()}] ${username} update successfully`);
            const responseMeta = {code: "1"};
            res.send(responseMeta);
        } else{
            connection.release();
            console.log(`[${clock.consoleTime()}] ${username} is Not Found in Database!`);
            const responseMeta = {code: "0"};
            res.send(responseMeta);
        }
    } catch (error) {  
        console.log(`[${clock.consoleTime()}] Error update ${username}`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    } finally {
        connection.release();
    }
});

//POST /Login: 使用者登入
//接收格式：x-www-form-urlencoded
app.post("/Login",bruteforce.prevent, async function(req, res) {
    const {username, password} = req.body;
    const searchSQL = `SELECT username,LoginName,password FROM Users WHERE username = '${username}'`;

    const cnDB = database.cnDB(); 
    const connection = await cnDB.getConnection();
  
    /*檢查使用者是否存在資料庫且比對傳送過來的資料是否一致*/
    console.log(`[${clock.consoleTime()}] HTTP POST /Login`);
    try {  
        const [results] = await connection.execute(searchSQL);
        if (results.length == 0) {
            connection.release();
            console.log(`[${clock.consoleTime()}] ${username} is Not Found!`);
            const responseMeta = {code: "-1"};
            res.send(responseMeta); 
        } else {
            const hashedPassword = results[0].password;
            const LoginName = results[0].LoginName;
            if (await bcrypt.compare(password, hashedPassword)) {
                console.log(`[${clock.consoleTime()}] ${username} is Login Successful!`);
                const responseMeta = {
                    code: "1",
                    username: username,
                    LoginName: LoginName
                };
                res.json(responseMeta);
            }else{
                console.log(`[${clock.consoleTime()}] ${username} is Password incorrect!!`);
                const responseMeta = {code: "0"};
                res.send(responseMeta);
            } 
        }
    } catch (error) {
        console.log(`[${clock.consoleTime()}] Error Login`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    } finally {
        connection.release();
    }
});

