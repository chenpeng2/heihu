import upcast from 'upcast';

/**
 * 获得变量的类型
 *
 * @param {any} v 变量
 * @returns
 */
export const getVariableType = v => {
  const TYPES = {
    undefined: 'undefined',
    number: 'number',
    boolean: 'boolean',
    string: 'string',
    '[object Function]': 'function',
    '[object RegExp]': 'regexp',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object Error]': 'error',
  };
  const TO_STRING = Object.prototype.toString;
  return TYPES[typeof v] || TYPES[TO_STRING.call(v)] || (v ? 'object' : 'null');
};

/**
 * 将变量的类型转变为指定的类型
 *
 * @param {any} v 变量
 * @param {string} targetType 目标类型
 */
export const convertVariableType = (v, targetType) => {
  const res = upcast.to(v, targetType);
  return res;
};

/**
 *
 *
 * @param {any} s 输入的字符串
 * @returns
 */
export const isJSON = s => {
  try {
    JSON.parse(s);
  } catch (err) {
    if (err) {
      return false;
    }
  }
  return true;
};

// 判断是null或者undefined
export const isNullOrUndefined = v => {
  return v === null || typeof v === 'undefined';
};

export default 'dummy';
