export const isPromise = obj => {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
};

// 判断是不是async函数
export const isAsync = e => {
  return Object.prototype.toString.call(e) === '[object AsyncFunction]';
};

export default 'dummy';
