const isEmpty = obj => {
  return !Object.keys(obj).length;
};

const filterEmptyProperty = obj => {
  Object.keys(obj).forEach(key => {
    if (obj[key] === null || obj[key] === '' || obj[key] === undefined) {
      delete obj[key];
    }
  });
  return obj;
};

/**
 * @description: 用来寻找object类型枚举常量。
 *
 * @date: 2019/4/4 下午12:15
 */
const baseFind = (allData, fieldname = 'value') => {
  return value => {
    let res = {};

    Object.values(allData).forEach(i => {
      if (i && i[`${fieldname}`] === value) res = i;
    });

    return res;
  };
};

export { isEmpty, baseFind, filterEmptyProperty };

export default 'dummy';
