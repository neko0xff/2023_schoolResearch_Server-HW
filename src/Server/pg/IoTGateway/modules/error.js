// deno-lint-ignore-file require-await
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
const errorController = async function (_req, res, _next) { 
  res.send({
    message: '正常狀態',
  });
};
const someController = async function (_req, res, _next) { 
  res.send({
    message: '正常狀態',
  });
};

/*錯誤處理*/
function handleError(res, error, statusCode = 500) {
  const responseMeta = { 
      code: "-1",
      error: error.message 
  };

  console.error(`[${clock.consoleTime()}] Error: ${error.message}`);
  res.status(statusCode).send(responseMeta);
}

const error = {
  errorController,
  someController,
  catchError,
  handleError
}

export default error;