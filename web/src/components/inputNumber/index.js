import React from 'react';
import { InputNumber } from 'antd';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';

const InputNumberWithIntl = injectIntl(props => {
  const { placeholder, intl, ...rest } = props;
  return <InputNumber placeholder={changeChineseToLocale(placeholder || '请填写', intl)} {...rest} />;
});

export default InputNumberWithIntl;
