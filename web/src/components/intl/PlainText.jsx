import React from 'react';
import _ from 'lodash';
import { changeChineseToLocale, changeChineseTemplateToLocale } from 'src/utils/locale/utils';
import { injectIntl } from 'react-intl';

type PlainTextPropsType = {
  intl: any,
  intlParams: Object,
  style: Object,
};

function PlainText(props: PlainTextPropsType) {
  const { text, intl, intlParams, style, ...rest } = props || {};
  if (typeof text !== 'string') return text;
  const defaultStyle = { display: 'inline-block' };

  return (
    <p style={{ ...defaultStyle, ...style }} {...rest}>
      {!_.isEmpty(intlParams)
        ? changeChineseTemplateToLocale(text, intlParams, intl)
        : changeChineseToLocale(text, intl)}
    </p>
  );
}

export default injectIntl(PlainText);
