/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
/*相関函式庫*/
var bcrypt=require("bcrypt");
var clock=require("../modules/clock.js");
var httpServer=require("../modules/httpServer.js");
var database=require("../modules/database.js");
const ExpressBrute = require('express-brute'); 
const xss = require('xss');
const store = new ExpressBrute.MemoryStore();
const bruteforce = new ExpressBrute(store); 

/*資料庫*/
var cnDB=null;
var app=httpServer.app();

/*使用者認証*/

//POST /CreateUser => 建立使用者
//接收格式：x-www-form-urlencoded
app.post("/CreateUser", async function(req, res) {
    const {username, password, LoginName,email } = req.body;
    var salt = 10;
    const hashedPassword = bcrypt.hashSync(password, salt);
    const searchSQL = `SELECT username,LoginName,password,mail FROM Users WHERE username = '${username}'`;
    var userData = `('${username}','${hashedPassword}','${LoginName}','${email}')`;
    var addUserSQL = `INSERT INTO Users (username, password, LoginName,email) VALUES ${userData}`;
  
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
    const {username, password, LoginName, email } = req.body;
    var salt = 10;
    const hashedPassword = bcrypt.hashSync(password, salt);
    const searchSQL = `SELECT username,LoginName,password,email FROM Users WHERE username = '${username}'`;
    var UPDATEUserSQL = `UPDATE Users SET password='${hashedPassword}',LoginName='${LoginName}',email='${email}' WHERE username='${username}';`;
  
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
    const searchSQL = `SELECT username,password,LoginName,email FROM Users WHERE username = '${username}'`;

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
            const email = results[0].email;
            if (await bcrypt.compare(password, hashedPassword)) {
                console.log(`[${clock.consoleTime()}] ${username} is Login Successful!`);
                const responseMeta = {
                    code: "1",
                    username: username,
                    LoginName: LoginName,
                    email: email
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

//POST /emailAuthCheck: 使用者忘記密碼
//接收格式：x-www-form-urlencoded
app.post("/emailAuthCheck",async function(req, res) {
    const {email} = req.body;
    const searchSQL = `SELECT username,LoginName,email FROM Users WHERE email = '${email}'`;

    const cnDB = database.cnDB(); 
    const connection = await cnDB.getConnection();
  
    /*檢查使用者是否存在資料庫且比對傳送過來的資料是否一致*/
    console.log(`[${clock.consoleTime()}] HTTP POST /emailAuthCheck`);
    try {  
        const [results] = await connection.execute(searchSQL);
        const username = results[0].username;
        const LoginName = results[0].LoginName;

        if (results.length == 0) {
            connection.release();
            console.log(`[${clock.consoleTime()}] ${email} is Not Found!`);
            const responseMeta = {code: "-1"};
            res.send(responseMeta); 
        } else {
            if(email === results[0].email){
                console.log(`[${clock.consoleTime()}] ${email} is Auth Successful!`);
                const responseMeta = {
                    code: "1",
                    username: username,
                    LoginName: LoginName,
                    email: email
                };
                res.json(responseMeta);
            }else{
                console.log(`[${clock.consoleTime()}] ${email} is Auth Fail!!`);
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

//POST /UserCustomValue01 => 改變使用者相關資料
//接收格式：x-www-form-urlencoded
app.post("/UserCustomValue01", async function(req, res) {
    const {username, customvar01 } = req.body;
    const searchSQL = `SELECT username,customvar01 FROM Users WHERE username = '${username}'`;
    var UPDATEUserSQL = `UPDATE Users SET customvar01='${customvar01}' WHERE username='${username}';`;
  
    const cnDB = database.cnDB(); 
    const connection = await cnDB.getConnection();
  
    /*檢查使用者是否存在資料庫，若無則直接改變*/
    console.log(`[${clock.consoleTime()}] HTTP POST /UserCustomValue01`);
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
        console.log(`[${clock.consoleTime()}] ${username} Error update `);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    } finally {
        connection.release();
    }
});
