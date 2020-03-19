/* eslint-disable */
import BigJs from 'big.js';
import { MaxDigits, replaceSign } from '../constants';
import mathJs from 'mathjs'; // mathjs库的使用

const DIGIT_PATTERN = /(^|\s)\d+(?=\.?\d*($|\s))/g;
// 千位分隔符 每3位加一个逗号
const MILI_PATTERN = /(?=(?!\b)(\d{3})+\.?\b)/g;

export const max = (a, b) => {
  const _a = Number(a);
  const _b = Number(b);
  return _a > _b ? _a : _b;
};
export const min = (a, b) => {
  const _a = Number(a);
  const _b = Number(b);
  return _a < _b ? _a : _b;
};
export const sum = arr => arr.reduce((a, b) => a + b, 0);

export const round = (a, n = MaxDigits) => {
  if (isNaN(a) || typeof a !== 'number') {
    global.log('round函数收到不合法输入： ', a, ', 需要是number');
    return undefined;
  }
  return Math.round(a * 10 ** n) / 10 ** n;
};

// 为了兼容历史数据,如果历史数据中有精确度小于3（0.4444）的数据会使用原始的运算符来避免出现错误
const safeMaxLenJudge = (...all) => {
  let isSafe = true;
  all.forEach(item => {
    if (!item) {
      return;
    }
    const length = item.toString().split('.')[1] ? item.toString().split('.')[1].length : 0;
    if (length > MaxDigits) {
      isSafe = false;
    }
  });
  return isSafe;
};

export const thousandBitSeparator = num =>
  typeof num === 'number' || typeof num === 'string'
    ? num.toString().replace(DIGIT_PATTERN, m => m.replace(MILI_PATTERN, ','))
    : replaceSign;

// x, y代表的是加减的数字，n代表的是精度。
export const safeAdd = (x = 0, y = 0, n) => {
  if (!x && !y) {
    return 0;
  }
  if (!x) {
    return y;
  }
  if (!y) {
    return x;
  }
  if (!safeMaxLenJudge(x, y)) {
    return x + y;
  }
  const _arg1 = x.toString();
  const _arg2 = y.toString();
  const arg1Arr = _arg1.split('.');
  const arg2Arr = _arg2.split('.');
  const d1 = arg1Arr.length === 2 ? arg1Arr[1] : '';
  const d2 = arg2Arr.length === 2 ? arg2Arr[1] : '';
  const maxLen = Math.max(d1.length, d2.length);
  const m = 10 ** maxLen;
  const result = Number(((x * m + y * m) / m).toFixed(maxLen));
  return typeof n === 'number' ? Number(result.toFixed(n)) : result;
};

export const safeSub = (x, y, n) => {
  return safeAdd(x, -y, n);
};

export const safeAddAll = (...rest) => {
  return rest.reduce((sum, value) => {
    return safeAdd(sum, value);
  });
};

export const safeSubAll = (...rest) => {
  return rest.reduce((sum, value) => {
    return safeAdd(sum, -value);
  });
};

// 判断输入合法性
export const safeMul = (x = 1, y = 1, n) => {
  if (!safeMaxLenJudge(x, y)) {
    return x * y;
  }
  const r1 = x.toString();
  const r2 = y.toString();
  const m = (r1.split('.')[1] ? r1.split('.')[1].length : 0) + (r2.split('.')[1] ? r2.split('.')[1].length : 0);
  const resultVal = (Number(r1.replace('.', '')) * Number(r2.replace('.', ''))) / 10 ** m;
  return typeof n !== 'number' ? Number(resultVal) : Number(resultVal.toFixed(parseInt(n, 10)));
};

// 判断输入合法性
export const safeDiv = (x, y, n) => {
  if (!safeMaxLenJudge(x, y)) {
    return x / y;
  }
  const r1 = x.toString();
  const r2 = y.toString();
  const m = (r2.split('.')[1] ? r2.split('.')[1].length : 0) - (r1.split('.')[1] ? r1.split('.')[1].length : 0);
  const resultVal = (Number(r1.replace('.', '')) / Number(r2.replace('.', ''))) * 10 ** m;
  return typeof n !== 'number' ? Number(resultVal) : Number(resultVal.toFixed(parseInt(n, 10)));
};

export const Big = (x, _maxDigits) => {
  // 重写toFixed来保证需要只显示三位的地方有一个统一的接口
  const _toFixed = BigJs.prototype.toFixed;
  BigJs.prototype.toFixed = function(n = _maxDigits || MaxDigits) {
    return _toFixed.call(this, n);
  };
  // 重写valueOf将字符串变成number
  const _valueOf = BigJs.prototype.valueOf;
  BigJs.prototype.valueOf = function(n) {
    return Number(_valueOf.call(this));
  };
  return new BigJs(x);
};

// 利用mathjs处理分数
mathJs.config({
  number: 'Fraction',
});

// 判断一个数是不是分数
export const isFraction = a => {
  if (typeof a !== 'string') return false;

  const reg = /^(\-)?\d+(\/)\d+$/;

  if (reg.test(a)) return true;
  return false;
};

// 获取分数的组成:分子和分母
export const getFractionCompose = a => {
  if (!isFraction(a)) return null;

  const b = a.split('/');
  return { denominator: Number(b[1]), numerator: Number(b[0]) };
};

// 将后端来的分数拼接为字符串
export const getFractionString = a => {
  if (!a) return null;
  const { denominator, numerator } = a;
  const _res = numerator / denominator;

  if (Number.isInteger(_res)) {
    return _res;
  } else if (denominator === 1) {
    return numerator;
  } else {
    return `${numerator}/${denominator}`;
  }
};

// 将mathJs的计算结果format为分数
export const formatFraction = a => {
  if (!a) return null;
  let res = mathJs.format(a, { fraction: 'ratio' });

  if (isFraction(res)) {
    const fractionCompose = getFractionCompose(res);
    const _res = fractionCompose.numerator / fractionCompose.denominator;
    if (Number.isInteger(_res)) {
      return _res;
    }
  }

  return res;
};

// https://github.com/josdejong/mathjs/issues/1603
export const fraction = number => {
  if (typeof number === 'number' || typeof number === 'string') {
    return mathJs.fraction(number.toString());
  }
};

// 在支持分数的时候判断是否是数字
export const isNumber = a => {
  if (typeof a === 'number') {
    return true;
  }

  const reg = /^(\-)?\d+((\.||\/)\d+)?$/;
  if (reg.test(a)) {
    return true;
  }

  return false;
};

export { mathJs };
