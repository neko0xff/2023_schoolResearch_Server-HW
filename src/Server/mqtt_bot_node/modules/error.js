/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
/*相関函式庫*/
var xss = require("xss");
var express = require('express');
var clock=require("../modules/clock.js");
var httpServer=require("../modules/httpServer.js");

/*時間*/
var date= clock.SQLDate();
var time= clock.SQLTime();

/*資料庫&後端*/
var cnDB=null;
var app=httpServer.app();

/*當錯誤發生時*/
const catchError = (asyncFn) => {
    return (req, res, next) => {
      asyncFn(req, res, next)
        .catch((err) => {
          console.log(`[${clock.consoleTime}] 錯誤捕捉: ${err}`);
          res.status(500);
          res.send({
            message: 'Server Error'
          });
        }); // Promise
    };
};
const errorController = async function (req, res, next) { // 錯誤
  a; // 未定義
  res.send({
    message: '正常狀態',
  });
};
const someController = async function (req, res, next) { // 正常
  res.send({
    message: '正常狀態',
  });
};

module.exports={
  catchError:catchError,
  someController:someController,
  errorController:errorController,
};
