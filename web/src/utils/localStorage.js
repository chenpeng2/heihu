import _ from 'lodash';
import * as constants from 'src/constants';

export default class LocalStorage {
  static getUserInfo = () => _.get(JSON.parse(localStorage.getItem(constants.FIELDS.LOGIN_INFO)), 'data');

  static get(key) {
    const origin = localStorage.getItem(key);
    const { phone, code } = this.getUserInfo() || {};
    if (origin) {
      const value = JSON.parse(origin);
      if (key === 'auth' || key === 'CONFIG') {
        // auth和CONFIG永不过期
        return value.data;
      }
      const now = new Date().getTime();
      const storageTime = _.get(value, 'meta.time');
      const { userLimit, phone: storagePhone } = _.get(value, 'meta.user', {});
      const { orgLimit, code: storageCode } = _.get(value, 'meta.orgCode', {});

      // 是否符合读取限制条件
      const isTimeIncompatible = now - storageTime > value.meta.exp;
      const isUserIncompatible = userLimit && storagePhone !== phone;
      const isOrgIncompatible = orgLimit && storageCode !== code;

      if (isTimeIncompatible || isUserIncompatible || isOrgIncompatible) {
        if (key === 'token') {
          return 'expired';
        }
        localStorage.removeItem(key);
        return;
      }

      return value.data;
    }
    return null;
  }

  // limitOption为localStorage限制选项
  static set(key, data, limitOption = { expiration: 0, userLimit: false, orgLimit: false }) {
    const { expiration, userLimit, orgLimit } = limitOption;
    const { phone, code } = this.getUserInfo() || {};
    const value = {
      meta: {
        exp: typeof expiration === 'number' && expiration > 0 ? expiration * 1000 : 3 * 24 * 60 * 60 * 1000,
        time: new Date().getTime(),
        user: {
          phone,
          userLimit,
        },
        orgCode: {
          code,
          orgLimit,
        },
      },
      data,
    };

    localStorage.setItem(key, JSON.stringify(value));
  }

  static remove(key) {
    localStorage.removeItem(key);
  }

  static clear() {
    localStorage.clear();
  }
}

export const getTablePageSizeFromLocalStorage = tableUniqueKey => {
  const tableConfigs = LocalStorage.get(tableUniqueKey);
  return _.get(tableConfigs, 'pageSize', 10);
};

// 从localStorage中获取用户信息
export const getUserFromLocalStorage = () => {
  return LocalStorage.get(constants.FIELDS.USER);
};
