import React from 'react';
import { DatePicker } from 'antd';

import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { arrayIsEmpty } from 'utils/array';

const { RangePicker } = DatePicker;

const MyRangePicker = props => {
  const { intl, placeholder, ...rest } = props;
  const _placeholder = arrayIsEmpty(placeholder)
    ? [changeChineseToLocale('开始日期', intl), changeChineseToLocale('结束日期', intl)]
    : [changeChineseToLocale(placeholder[0], intl), changeChineseToLocale(placeholder[1], intl)];

  return (
    <RangePicker
      placeholder={_placeholder}
      {...rest}
      onFocus={e => e.preventDefault()}
      onBlur={e => e.preventDefault()}
    />
  );
};

export default injectIntl(MyRangePicker);
