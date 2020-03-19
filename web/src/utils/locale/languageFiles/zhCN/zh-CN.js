import appLocaleData from 'react-intl/locale-data/zh';
// 引入组件的多语言
import AntdLocale from 'antd/lib/locale-provider/zh_CN';
import MomentLocale from 'moment/locale/zh-cn';

import WebLocale from './web-cn.json';

// 将message的中文value反转为key
const chineseKeyMessage = () => {
  const res = {};
  Object.entries(WebLocale).forEach(([key, value]) => {
    res[value] = key;
  });
  return res;
};

const data = {
  // 合并所有 messages, 加入组件的 messages
  messages: Object.assign(
    {},
    {
      ...WebLocale,
    },
  ),

  antd: AntdLocale,

  moment: MomentLocale,

  chineseKeyMessage: chineseKeyMessage(),

  // locale
  locale: 'zh-CN',

  // react-intl locale-data
  data: appLocaleData,

  // 自定义 formates
  formats: {
    // 日期、时间
    date: {
      normal: {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      },
    },
    // 货币
    money: {
      currency: 'CNY',
    },
  },
};

export default data;
