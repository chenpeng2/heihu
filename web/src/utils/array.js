import _ from 'lodash';
// @flow

export const genArr = (length: number, from: number = 0, step: number = 1): Array<number> => {
  const arr = [];
  for (let i = from; i < length * step + from; i += step) {
    arr.push(i);
  }
  return arr;
};
/* [{"configKey": "erpSyncConfig", "configValue": "true"}] => {erpSyncConfig:"true"}
 */
export const convertConfig = (configArray: []): any => {
  const config = {};
  if (Array.isArray(configArray)) {
    configArray.forEach((element: { configKey: string, configValue: any }) => {
      config[element.configKey] = element.configValue;
    });
  }
  return config;
};

export const splitRequestData = (arr: Array<any>): Array<any> => {
  // split data to [ data ]
  const result = [];
  if (arr.length < 10) {
    result.push(arr);
  } else {
    const times = arr.length % 10 === 0 ? 10 : 11; // 分为几次发送
    const partAmount = Math.floor(arr.length / 10); // 每次发送多少条
    for (let i = 0; i < times; i += 1) {
      const start = i * partAmount;
      const end = i === 10 ? arr.length : (i + 1) * partAmount;
      result.push(arr.slice(start, end));
    }
  }
  console.log(result);
  return result;
};

export const arrayIsEmpty = array => {
  return !(Array.isArray(array) && array.length > 0);
};

export const splitRequestDataByFifty = (arr, _splitKey) => {
  // split data to [ data ]
  const chunkSize = 500;
  let splitKey = _splitKey;
  if (typeof _splitKey === 'string') {
    splitKey = [_splitKey];
  }
  const result = [];
  if (arr.length < chunkSize) {
    result.push(arr);
  } else {
    const times = Math.ceil(arr.length / chunkSize); // 分为几次发送
    const partAmount = times === 1 ? arr.length : chunkSize; // 每次发送多少条
    let lastEnd = 0;
    for (let i = 0; lastEnd + 1 < arr.length; i += 1) {
      const start = lastEnd;
      let end = (i + 1) * partAmount;
      if (i === times - 1) {
        end = arr.length;
      }
      if (start >= end) {
        continue;
      }
      if (!arrayIsEmpty(splitKey)) {
        while (
          end !== arr.length &&
          _.isEqualWith(arr[end - 1], arr[end], (a, b) => {
            return _.reduce(splitKey, (pre, cur) => pre && _.get(a, cur) === _.get(b, cur), true);
          })
        ) {
          end += 1;
        }
      }
      lastEnd = end;
      result.push(arr.slice(start, end));
    }
  }
  return result;
};

export const swapArray = (arr, index, afterIndex) => {
  if (!Array.isArray(arr)) {
    return arr;
  }
  const temp = arr[index];
  arr[index] = arr[afterIndex];
  arr[afterIndex] = temp;
  return [...arr];
};

export const arrayRemoveDuplicates = array => {
  if (arrayIsEmpty(array)) {
    return array;
  }
  return array.filter((item, index) => array.indexOf(item) === index);
};

export default 'dummy';
