import appLocaleData from 'react-intl/locale-data/en';
// 引入组件的多语言
import AntdLocale from 'antd/lib/locale-provider/en_US';
import MomentLocale from 'moment/locale/en-au';
import WebLocale from './web-en.json';

const data = {
  // 合并所有 messages, 加入组件的 messages
  messages: Object.assign({}, {
    ...WebLocale,
  }),

  antd: AntdLocale,

  moment: MomentLocale,

  // locale
  locale: 'en-US',

  // react-intl locale-data
  data: appLocaleData,

  // 自定义 formates
  formats: {
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
      currency: 'USD',
    },
  },
};

export default data;
