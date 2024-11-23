/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
/*相関函式庫*/
var clock=require("../modules/clock.js");

/*當錯誤發生時*/
const catchError = (asyncFn) => {
    return (req, res, next) => {
      asyncFn(req, res, next)
        .catch((err) => {
          console.log(`[${clock.consoleTime}] Error: ${err}`);
          res.status(500);
          res.send({
            message: 'Server Error'
          });
        }); 
    };
};
const errorController = async function (req, res, next) { 
  res.send({
    message: '正常狀態',
  });
};
const someController = async function (req, res, next) { 
  res.send({
    message: '正常狀態',
  });
};

module.exports={
  catchError:catchError,
  someController:someController,
  errorController:errorController,
};
