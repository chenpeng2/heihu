import { defineMessages } from 'react-intl';
import _ from 'lodash';
import { baseFind } from 'src/utils/object';
import LocalStorage from 'src/utils/localStorage';
import log from 'src/utils/log';
import { orgInfo, getUserInfo } from 'src/services/auth/user';
import { isNullOrUndefined } from 'src/utils/variableType';

const zhCn = require('./languageFiles/zhCN/zh-CN');
const enUs = require('./languageFiles/enUS/en-US');
const koKR = require('./languageFiles/koKR/ko-KR');

// 支持的语言列表
// headerValue是后端需要的语言key，和react-intl有不兼容的问题
// value是符合 http://download.geonames.org/export/dump/countryInfo.txt 标准的语言缩写
// 因为languageList中都是大写国家，所以无法兼容safari
export const LANGUAGE_LIST = {
  english: { headerValue: 'en_US', label: 'English-EN', value: 'en-US' },
  chinese: { headerValue: 'cn_ZH', label: '中文-ZH', value: 'zh-CN' },
  korean: { headerValue: 'ko_KR', label: '한국어-KO', value: 'ko-KR' },
  default: { headerValue: 'default', label: '跟随工厂默认语言', value: 'default' },
};

// 通过value来找到支持的语言
export const findLanguage = baseFind(LANGUAGE_LIST);

// 通过headerValue来找到语言
export const findLanguageByHeaderValue = baseFind(LANGUAGE_LIST, 'headerValue');

// 获取对应的语言文件
export const getLocale = lang => {
  let result = {};
  switch (lang) {
    case LANGUAGE_LIST.chinese.value:
      result = zhCn;
      break;
    case LANGUAGE_LIST.english.value:
      result = enUs;
      break;
    case LANGUAGE_LIST.korean.value:
      result = koKR;
      break;
    default:
      result = zhCn;
  }

  return result.default || result;
};

// localStorage中的languageType
const KEY_FOR_LANGUAGE = 'languageType';
export const setLanguageTypeInLocalStorage = value => LocalStorage.set(KEY_FOR_LANGUAGE, value);
export const getLanguageTypeInLocalStorage = () => LocalStorage.get(KEY_FOR_LANGUAGE);

// 获取初始的语言类型。项目开始的时候需要有语言类型。不能等待加载
export const getInitialLanguageType = () => {
  // 先从本地获取语言类型
  let _type = getLanguageTypeInLocalStorage();

  if (!_type) {
    const browserLanguage = window.navigator.language;
    // 因为languageList中都是大写国家，所以无法兼容safari
    const { value } = findLanguage(browserLanguage);
    _type = value;
  }

  setLanguageTypeInLocalStorage(_type);

  return _type;
};

// 从本地，后端获取业务上的语言设置
export const getLanguageType = async () => {
  // 先从本地获取语言类型
  let _type = getLanguageTypeInLocalStorage();

  // 如果本地没有存储
  if (!_type) {
    // 从userInfo中获取语言类型。如果是默认值（跟随工厂的默认语言）使用工厂的语言，如果不是默认值那么使用
    const res = await getUserInfo();
    _type = _.get(res, 'data.data.xlanguage');
    if (_type === LANGUAGE_LIST.default.value) {
      // 从工厂信息中获取工厂的语言类型
      const res = await orgInfo();
      _type = _.get(res, 'data.data.xlanguage');
    }
  }

  if (!_type) _type = LANGUAGE_LIST.chinese.value;

  // 将语言类型设置到本地
  setLanguageTypeInLocalStorage(_type);

  return _type;
};

// 将一种语言的文本转换为web当前语言的文本
// intl参数是react-intl给的api集合。必填。利用injectIntl高阶函数，或者从context中得到
// messageOptions的细节：{ id, description?, defaultMessage?, }
// formatOption: 需要替换的message中的value
// 关于messageOptions和formatOptions的具体细节： https://github.com/formatjs/react-intl/blob/master/docs/API.md#definemessages
export const changeTextLanguage = (intl, messageOptions, formatOption) => {
  if (!intl || typeof intl.formatMessage !== 'function') return;

  const message = defineMessages({ text: messageOptions });
  return intl.formatMessage(message.text, formatOption);
};

// 根据中文语言来找到对应的key
// 因为国际化文件中intlId和语言一一对应，key可以找到value，其实value也可以找到key
export const findIntlIdByChineseText = text => {
  const { chineseKeyMessage } = zhCn.default || {};
  return chineseKeyMessage ? chineseKeyMessage[text] : text;
};

// 将模版文字国际化
export const changeChineseTemplateToLocale = (text, params, intl) => {
  const id = findIntlIdByChineseText(text);
  // 模版文字在没有id的时候不做错误处理。是因为直接返回的text是模版。无法使用。因此必须要保证模版文字的id是可知的
  if (!id) {
    log.error(`这条文字：${text}在web-cn中没有对应`);
  }
  return changeTextLanguage(intl, { id, defaultMessage: text }, params);
};

// 将中文自动转换为当前的语言
// 不放在intl的format中因为有循环调用的问题
export const changeChineseToLocale = (text, intl) => {
  if (typeof text !== 'string') return text;
  if (!intl) return text;
  // 先自动找到对应的intlId
  const intlId = findIntlIdByChineseText(text);
  // 然后转换
  if (!intlId) return text;

  return changeTextLanguage(intl, { id: intlId, defaultMessage: text });
};

// 从文件中找到对应id的语言
// 这个方法绕过来intl的框架直接利用localStorage和语言文件来获取对应的翻译
// 如果不是必要不要使用这个方法
export const changeChineseToLocaleWithoutIntl = (text, value) => {
  const languageType = getLanguageTypeInLocalStorage();
  const intlId = findIntlIdByChineseText(text);

  if (!intlId) return text;

  // 将有变量的字符串替换
  const replaceValue = (str, values) => {
    if (!values) return str;
    if (typeof str !== 'string') return str;

    // 将{xx}格式的变量替换为对应的值
    const reg = /(\{\w+\})/g;
    return str.replace(reg, strNeedToReplace => {
      // 去除{}
      const keyName = strNeedToReplace.slice(1, -1);
      if (isNullOrUndefined(values[keyName])) {
        return keyName;
      }
      const keyNameIntlId = findIntlIdByChineseText(values[keyName]);
      if (!keyNameIntlId) {
        return values[keyName];
      }
      switch (languageType) {
        case LANGUAGE_LIST.chinese.value:
          return zhCn.default.messages[keyNameIntlId];
        case LANGUAGE_LIST.english.value:
          return enUs.default.messages[keyNameIntlId];
        case LANGUAGE_LIST.korean.value:
          return koKR.default.messages[keyNameIntlId];
        default:
          return values[keyName];
      }
    });
  };

  let res = text;
  // 先将带字符串替换成对应语言的字符串，然后通过replaceValue方法，无变量返回原字符串，有变量，使用正则替换其中的变量
  switch (languageType) {
    case LANGUAGE_LIST.chinese.value:
      res = replaceValue(zhCn.default.messages[intlId], value);
      break;
    case LANGUAGE_LIST.english.value:
      res = replaceValue(enUs.default.messages[intlId], value);
      break;
    case LANGUAGE_LIST.korean.value:
      res = replaceValue(koKR.default.messages[intlId], value);
      break;
    default:
      res = text;
  }

  return res;
};

export default 'dummy';
