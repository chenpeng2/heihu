/**
* @description: 国际化provider，用来处理公共的国际化方法
*
* @date: 2019/8/9 上午11:17
*/
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import { changeChineseToLocale, changeChineseTemplateToLocale } from 'src/utils/locale/utils';

class GcLocaleProvider extends React.Component {
  static propTypes = {
    children: PropTypes.any,
    intl: PropTypes.any,
    changeLanguageType: PropTypes.any,
  };

  static childContextTypes = {
    // 语言信息
    changeChineseToLocale: PropTypes.any,
    changeChineseTemplateToLocale: PropTypes.any,
    changeLanguageType: PropTypes.any,
  };

  getChildContext() {
    const { intl, changeLanguageType } = this.props;
    return {
      changeChineseToLocale: text => changeChineseToLocale(text, intl),
      changeChineseTemplateToLocale: (text, params) => changeChineseTemplateToLocale(text, params, intl),
      changeLanguageType,
    };
  }

  render() {
    return React.Children.only(this.props.children);
  }
}

export default injectIntl(GcLocaleProvider);
