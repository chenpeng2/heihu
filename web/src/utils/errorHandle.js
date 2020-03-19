// import { message } from 'antd';

// errorForamt对error进行格式处理来获得统一的格式
const errorFormat = (err, cb) => {
  if (cb) {
    return cb(err) || err;
  }
  if (err.source) {
    const errorMessages = err.source.errors && err.source.errors.map(error => {
      const { message, originalMessage } = error;
      return `${message} ${originalMessage}`;
    });
    err.message = errorMessages && errorMessages.join('\n\r');
    return err;
  }
  if (err.message) {
    return err;
  }
  return err;
};

/**
 *
 * @apiName errorHandle
 * @apiGroup errorHandle
 *
 *
 * @apiParam  {Object} error 错误
 * @apiParam  {Function} cb 回调函数，接受error作为参数, 没有回调函数的时候会使用message.error
 * @apiParam  {Function} formateFn error处理函数，接受error作为参数, 将错误处理成需要的格式
 *
 *
 */
const errorHandle = (error, cb, formateFn) => {
  const _error = errorFormat(error, formateFn);
  if (_error && _error.message && cb) {
    // TODO:bai 是否应该这样处理error？是否需要cb？还是统一处理不提供开放接口?
    // 当error是符合规则的时候会执行log.error;
    global.log.error(_error.message);
    return cb(_error) || _error;
  }
  return _error;
};

/**
 *
 * @apiName defaultErrorsHandle
 * @apiGroup errorHandle
 *
 *
 * @apiParam  {Array} errors 错误集合，因为errors可能是多个，所以使用数组
 * @apiParam  {Function} cb 回调函数，接受error作为参数,没有回调函数的时候会使用message.error
 * @apiParam  {Function} formateFn error处理函数，接受error作为参数, 将错误处理成需要的格式
 *
 *
 */

const errorsHandle = (errors, cb, formatFn) => {
  if (errors && errors.length) {
    return errors.map(error => errorHandle(error, cb, formatFn));
  }
  return errors;
};

export { errorsHandle, errorHandle, errorFormat };

export default 'dummy';
