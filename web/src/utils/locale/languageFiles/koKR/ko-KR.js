import appLocaleData from 'react-intl/locale-data/ko';
// 引入组件的多语言
import AntdLocale from 'antd/lib/locale-provider/ko_KR';
import MomentLocale from 'moment/locale/ko';

import WebLocale from './web-ko.json';

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
  locale: 'ko-KR',

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
