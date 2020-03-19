import JsSha from 'jssha';
import _ from 'lodash';
import log from 'src/utils/log';
import BigJs from 'big.js';

export const plural = string => (string === 'process' ? `${string}es` : `${string}s`);

export const stringHashToNumber = string =>
  string
    .split('')
    .map(char => char.charCodeAt(0))
    .filter(charCode => charCode >= 0)
    .reduce((result, charCode, index) => result + charCode + index, string.length);

export const stringEllipsis = (_string, length) => {
  const string = String(_string);
  if (!string || string.length < length) {
    return string;
  }
  return `${string.substring(0, length - 3)}...`;
};

export const stringEllipsis2 = (_string, length) => {
  const string = String(_string);
  if (!string || string.length < length) {
    return string;
  }
  return `${string.substring(0, length)}...`;
};

export const fileHashtoFile = string => {
  if (!string) {
    return null;
  }
  const res = {};
  res.url = string;
  const start = string.lastIndexOf('/');
  res.name = decodeURIComponent(string.substring(start + 1, string.lastIndexOf('-')));
  return res;
};

export const parseFileName = fileName => {
  const index = fileName && fileName.lastIndexOf('.');
  if (!fileName || index === -1) {
    return {
      name: undefined,
      type: undefined,
    };
  }
  return {
    name: fileName.substring(0, index),
    type: fileName.substring(index + 1, fileName.length),
  };
};

export const hashPassword = password => {
  const sha = new JsSha('SHA3-224', 'TEXT');
  sha.update(password);
  return sha.getHash('HEX');
};

export const newline = '\n';

// 将毫秒数转换成对应单位 单位有 ms/m/h/d
// TODO: 目前仅支持fromUnit是ms
export const convertTimeAndUnit = ({ time, fromUnit = 'ms', targetUnit, raw = false } = {}) => {
  if (time === undefined || !targetUnit) {
    log.error('时间转换必须传入时间和目标单位');
  }
  if (fromUnit !== 'ms') {
    log.error('暂不支持其他单位的转换');
  }
  let res;
  let _time = time;
  if (fromUnit === 'ms' && targetUnit === 'm') {
    _time = new BigJs(time).div(60 * 1000).valueOf();
    res = raw ? { time: _time, unit: targetUnit } : `${_time}分钟`;
  } else if (fromUnit === 'ms' && targetUnit === 'h') {
    _time = new BigJs(time).div(60 * 60 * 1000).valueOf();
    res = raw ? { time: _time, unit: targetUnit } : `${_time}小时`;
  } else if (fromUnit === 'ms' && targetUnit === 'd') {
    _time = new BigJs(time).div(24 * 60 * 60 * 1000).valueOf();
    res = raw ? { time: _time, unit: targetUnit } : `${_time}天`;
  }
  return res;
};

/*
export const pinyin = (word) => {
  if (!word) {
    return null;
  }
  return _.flatten(localPinyin(word)).join();
};

export const pinyinWithoutTone = (word) => {
  if (!word) {
    return null;
  }
  return _.flatten(localPinyin(word, { style: localPinyin.STYLE_NORMAL })).join('');
};
*/
