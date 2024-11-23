/*相関函式庫*/
var clock=require("../modules/clock.js");

/*主程式*/
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
  a; 
  res.send({
    message: 'It Work!',
  });
};
const someController = async function (req, res, next) { 
  res.send({
    message: 'It Work!',
  });
};

module.exports={
  catchError:catchError,
  someController:someController,
  errorController:errorController,
};
