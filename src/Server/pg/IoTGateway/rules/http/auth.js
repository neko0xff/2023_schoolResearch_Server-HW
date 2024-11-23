/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */

/*相關函式庫*/
var bcrypt = require("bcrypt");
var clock = require("../../modules/clock.js");
var httpServer = require("../../modules/httpServer.js");
var database = require("../../modules/database.js");
var error = require("../../modules/error.js");
var catchError = error.catchError;
var errorController = error.errorController;

/*資料庫&後端*/
var app = httpServer.app();

/*使用者認證*/
// POST /auth/CreateUser => 建立使用者
// 接收格式：x-www-form-urlencoded
app.post("/auth/CreateUser", async function (req, res) {
    const { username, password, LoginName, email } = req.body;
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds); 
    const cnDB = database.cnDB();
    const connection = await cnDB.connect();
    const addUserSQL = `
        INSERT INTO sensordb.users (username, password, loginname, email)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) 
        DO NOTHING;
    `;
    
    console.log(`[${clock.consoleTime()}] HTTP POST /auth/CreateUser`);

    try {
        const result = await connection.query(addUserSQL, [username, hashedPassword, LoginName, email]);
      
        if (result.rowCount === 0) {
            const responseMeta = { 
                code: "0",
                message: "User already exists"
            };
            console.log(`[${clock.consoleTime()}] ${username} already exists!`);
            return res.status(400).send(responseMeta);
        }else{
            const responseMeta = { 
                code: "1",
                message: "User created successfully"
            };
            console.log(`[${clock.consoleTime()}] ${username} created successfully`);
            return res.status(201).send(responseMeta);
        }
     
    } catch (error) {
        const responseMeta = { 
            code: "-1",
            error: error.message 
        };

        console.error(`[${clock.consoleTime()}] Error creating user: ${username}`, error);
        return res.status(500).send(responseMeta);
    } finally {
        connection.release(); 
    }
}, catchError(errorController));



// POST /auth/UpdateUserData => 改變使用者相關資料
// 接收格式：x-www-form-urlencoded
app.post("/auth/UpdateUserData", async function (req, res) {
    const { username, password, LoginName, email } = req.body;
    const cnDB = database.cnDB();
    const connection = await cnDB.connect();
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const searchSQL = `
        SELECT username, loginname AS "LoginName", password, email 
        FROM sensordb.users 
        WHERE username = $1;
    `;
    const updateUserSQL = `
        UPDATE sensordb.users 
        SET password = $1, loginname = $2, email = $3 
        WHERE username = $4;
    `;

    console.log(`[${clock.consoleTime()}] HTTP POST /auth/UpdateUserData`);
    try {
        const { rows: results } = await connection.query(searchSQL, [username]);
        if (results.length !== 0) {
            const responseMeta = { 
                code: "1",
                message: "User updated successfully"
             };

            await connection.query(updateUserSQL, [hashedPassword, LoginName, email, username]);
            console.log(`[${clock.consoleTime()}] ${username} updated successfully`);
            res.send(responseMeta);
        } else {
            const responseMeta = { 
                code: "0",
                message: "User not found!"
            };

            console.log(`[${clock.consoleTime()}] ${username} not found!`);
            res.send(responseMeta);
        }
    } catch (error) {
        const responseMeta = { 
            code: "-1",
             error: error.message 
        };
        console.error(`[${clock.consoleTime()}] Error updating ${username}`, error);
        res.status(500).send(responseMeta);
    } finally {
        connection.release();
    }
}, catchError(errorController));

// POST /auth/Login => 使用者登入
// 接收格式：x-www-form-urlencoded
app.post("/auth/Login", async function (req, res) {
    const { username, password } = req.body;
    const cnDB = database.cnDB();
    const connection = await cnDB.connect();
    const searchSQL = `
        SELECT username, password, loginname AS "LoginName", email 
        FROM sensordb.users 
        WHERE username = $1;
    `;

    console.log(`[${clock.consoleTime()}] HTTP POST /auth/Login`);
    try {
        const { rows: results } = await connection.query(searchSQL, [username]);
        if (results.length === 0) {
            const responseMeta = { 
                code: "-1",
                message: `${username} not found!`
            };

            console.log(`[${clock.consoleTime()}] ${username} not found!`);
            res.send(responseMeta);
        } else {
            const hashedPassword = results[0].password;
            const isValid = await bcrypt.compare(password, hashedPassword);
            if (isValid) {
                console.log(`[${clock.consoleTime()}] ${username} login successful!`);
                const responseMeta = {
                    code: "1",
                    username: username,
                    LoginName: results[0].LoginName,
                    email: results[0].email,
                };
                res.json(responseMeta);
            } else {
                const responseMeta = { 
                    code: "0",
                    message: `Incorrect password for ${username}`
                 };

                console.log(`[${clock.consoleTime()}] Incorrect password for ${username}`);
                res.send(responseMeta);
            }
        }
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Error during login`, error);
        const responseMeta = { code: "-1", error: error.message };
        res.status(500).send(responseMeta);
    } finally {
        connection.release();
    }
}, catchError(errorController));

// POST /auth/MasterLogin: 管理者登入
// 接收格式：x-www-form-urlencoded
app.post("/auth/MasterLogin", async function(req, res) {
    const { username, password } = req.body;
    const cnDB = database.cnDB();
    const connection = await cnDB.connect();
    const searchSQL = `
        SELECT username, password, loginname AS "LoginName", email 
        FROM sensordb.users 
        WHERE username = $1;
    `;

    console.log(`[${clock.consoleTime()}] HTTP POST /auth/MasterLogin`);
    if (!username || !password) {
        const responseMeta = { 
            code: "-1", 
            error: "Missing data in request"
         };

        console.log(`[${clock.consoleTime()}] Missing data in request.`);
        return res.status(400).send(responseMeta);
    }
    if (username !== "master") {
        const responseMeta = { 
            code: "-1", 
            error: "Unauthorized access" 
        };

        console.log(`[${clock.consoleTime()}] Unauthorized access. Only 'master' is allowed.`);
        return res.status(403).send(responseMeta);
    }

    try {
        const results = await connection.query(searchSQL, [username]);
        
        if (!results.rows || results.rows.length === 0) {
            const responseMeta = { 
                code: "-1",
                message: `${username} is Not Found!`
             };

             console.log(`[${clock.consoleTime()}] ${username} is Not Found!`);
            return res.send(responseMeta);
        }

        const user = results.rows[0];
        const hashedPassword = user.password;
        const isValidPassword = await bcrypt.compare(password, hashedPassword);

        if (isValidPassword) {
            const responseMeta = {
                code: "1",
                username: user.username,
                LoginName: user.LoginName,
                email: user.email
            };

            console.log(`[${clock.consoleTime()}] ${username} is Login Successful!`);
            return res.json(responseMeta);
        } else {
            const responseMeta = { 
                code: "0",
                message: `${username} is Password incorrect!!`
            };

            console.log(`[${clock.consoleTime()}] ${username} is Password incorrect!!`);
            return res.send(responseMeta);
        }
    } catch (error) {
        const responseMeta = { 
            code: "-1", 
            error: error.message 
        };

        console.log(`[${clock.consoleTime()}] Error Login:`, error.message);
        return res.status(500).send(responseMeta);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// POST /auth/emailAuthCheck: 使用者忘記密碼
// 接收格式：x-www-form-urlencoded
app.post("/auth/emailAuthCheck", async function(req, res) {
    const { email } = req.body;
    const cnDB = database.cnDB();
    const connection = await cnDB.connect();
    const searchSQL = `
        SELECT username, loginname AS "LoginName", email 
        FROM sensordb.users
        WHERE email = $1;
    `;
    
    console.log(`[${clock.consoleTime()}] HTTP POST /auth/emailAuthCheck`);
    if (!email) {
        const responseMeta = { 
            code: "-1",
            error: "Missing email in request"
        };

        console.log(`[${clock.consoleTime()}] Missing email in request.`);
        return res.status(400).send(responseMeta);
    }
  
    try {
        const results = await connection.query(searchSQL, [email]);
        const user = results.rows[0];
        
        if (!results.rows || results.rows.length === 0) {
            const responseMeta = { 
                code: "-1",
                message:  `${email} is Not Found!`
             };

            console.log(`[${clock.consoleTime()}] ${email} is Not Found!`);
            return res.send(responseMeta);
        }
        if (email === user.email) {
            const responseMeta = {
                code: "1",
                username: user.username,
                LoginName: user.loginname,
                email: user.email
            };

            console.log(`[${clock.consoleTime()}] ${email} is Auth Successful!`);
            return res.json(responseMeta);
        } else {
            const responseMeta = { 
                code: "0",
                message:  `${email} is Auth Fail!!`
             };

            console.log(`[${clock.consoleTime()}] ${email} is Auth Fail!!`);
            return res.send(responseMeta);
        }
    } catch (error) {
        const responseMeta = { 
            code: "-1", 
            error: error.message 
        };

        console.log(`[${clock.consoleTime()}] Error in email authentication:`, error.message);
        return res.status(500).send(responseMeta);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});