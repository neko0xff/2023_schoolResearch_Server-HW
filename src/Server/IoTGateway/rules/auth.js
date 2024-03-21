/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */

/*相関函式庫*/
var bcrypt=require("bcrypt");
var clock=require("../modules/clock.js");
var httpServer=require("../modules/httpServer.js");
var database=require("../modules/database.js");
var error=require("../modules/error.js");
var catchError = error.catchError;
var errorController = error.errorController;
const ExpressBrute = require('express-brute'); 
const xss = require('xss');
const store = new ExpressBrute.MemoryStore();
const bruteforce = new ExpressBrute(store); 

/*資料庫&後端*/
var cnDB=null;
var app=httpServer.app();

/*使用者認証*/
//POST /auth/CreateUser => 建立使用者
//接收格式：x-www-form-urlencoded
app.post("/auth/CreateUser", async function(req, res) {
    const {username, password, LoginName,email } = req.body;
    var salt = 10;
    const hashedPassword = bcrypt.hashSync(password, salt);
    const searchSQL = `SELECT username,LoginName,password,email FROM Users WHERE username = ? ;`;
    var addUserSQL = `INSERT INTO Users (username, password, LoginName,email) VALUES (?,?,?,?);`;
  
    const cnDB = database.cnDB(); 
    const connection = await cnDB.getConnection();
  
    /*檢查使用者是否存在資料庫，若無則直接建立*/
    console.log(`[${clock.consoleTime()}] HTTP POST /auth/CreateUser`);
    try {  
        const [results] = await connection.execute(searchSQL,[username]);
        if (results.length !== 0) {
            connection.release();
            console.log(`[${clock.consoleTime()}] ${username} already created!`);
            const responseMeta = {code: "0"};
            res.send(responseMeta);
        } else {
            await connection.execute(addUserSQL,[username,hashedPassword,LoginName,email]);
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
},catchError(errorController));

//POST /auth/UpdateUserData => 改變使用者相關資料
//接收格式：x-www-form-urlencoded
app.post("/auth/UpdateUserData", async function(req, res) {
    const {username, password, LoginName, email } = req.body;
    var salt = 10;
    const hashedPassword = bcrypt.hashSync(password, salt);
    const searchSQL = `SELECT username,LoginName,password,email FROM Users WHERE username = ? ;`;
    var UPDATEUserSQL = `UPDATE Users SET password = ?,LoginName = ?,email = ? WHERE username = ? ;`;
  
    const cnDB = database.cnDB(); 
    const connection = await cnDB.getConnection();
  
    /*檢查使用者是否存在資料庫，若無則直接改變*/
    console.log(`[${clock.consoleTime()}] HTTP POST /auth/UpdateUserData`);
    try {  
        const [results] = await connection.execute(searchSQL,[username]);
        if (results.length !== 0) {
            await connection.execute(UPDATEUserSQL,[hashedPassword,LoginName,email,username]);
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
},catchError(errorController));

//POST /auth/Login: 使用者登入
//接收格式：x-www-form-urlencoded
app.post("/auth/Login",bruteforce.prevent, async function(req, res) {
    const {username, password} = req.body;
    const searchSQL = `SELECT username,password,LoginName,email FROM Users WHERE username = ? ;'`;

    const cnDB = database.cnDB(); 
    const connection = await cnDB.getConnection();
  
    /*檢查使用者是否存在資料庫且比對傳送過來的資料是否一致*/
    console.log(`[${clock.consoleTime()}] HTTP POST /auth/Login`);
    try {  
        const [results] = await connection.execute(searchSQL,[username]);
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
},catchError(errorController));

//POST /auth/MasterLogin: 管理者登入
//接收格式：x-www-form-urlencoded
app.post("/auth/MasterLogin",bruteforce.prevent, async function(req, res) {
    const {username, password} = req.body;
    console.log(`[${clock.consoleTime()}] HTTP POST /auth/MasterLogin`);
    
    if (!username === undefined) {
        // 檢查是否有缺少必要的資料
        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        const responseMeta = { code: "-1", error: "Missing data in request" };
        return res.status(400).send(responseMeta);
    }
    if (username !== "master") {
        // 登入身份是否是`master`
        console.log(`[${clock.consoleTime()}] Unauthorized access. Only 'master' is allowed.`);
        const responseMeta = { code: "-1", error: "Unauthorized access" };
        return res.status(403).send(responseMeta);
    }

    const searchSQL = `SELECT username,password,LoginName,email FROM Users WHERE username = ? ;`;
    const cnDB = database.cnDB(); 
    const connection = await cnDB.getConnection();
  
    /*檢查使用者是否存在資料庫且比對傳送過來的資料是否一致*/
    try {  
        const [results] = await connection.execute(searchSQL,[username]);
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
},catchError(errorController));

//POST /auth/emailAuthCheck: 使用者忘記密碼
//接收格式：x-www-form-urlencoded
app.post("/auth/emailAuthCheck",async function(req, res) {
    const {email} = req.body;
    const searchSQL = `SELECT username,LoginName,email FROM Users WHERE email = ? ;`;

    const cnDB = database.cnDB(); 
    const connection = await cnDB.getConnection();
  
    /*檢查使用者是否存在資料庫且比對傳送過來的資料是否一致*/
    console.log(`[${clock.consoleTime()}] HTTP POST /auth/emailAuthCheck`);
    try {  
        const [results] = await connection.execute(searchSQL,[email]);
        const username = results[0].username;
        const LoginName = results[0].LoginName;

        if (results.length !== 0) {
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
             
        } else {
            connection.release();
            console.log(`[${clock.consoleTime()}] ${email} is Not Found!`);
            const responseMeta = {code: "-1"};
            res.send(responseMeta);
        }
    } catch (error) {
        console.log(`[${clock.consoleTime()}] Error Login`);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    } finally {
        connection.release();
    }
},catchError(errorController));
