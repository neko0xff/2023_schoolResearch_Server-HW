/*相関函式庫*/
import clock from "./clock.js";

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

const error = {
  errorController,
  someController,
  catchError
}

export default error;