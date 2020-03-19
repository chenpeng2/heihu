/**
 * @description: 详情页的Item
 *
 * @date: 2019/7/5 下午5:51
 */
import React from 'react';
import { injectIntl } from 'react-intl';

import { middleGrey } from 'src/styles/color';
import { replaceSign } from 'src/constants';
import { changeChineseToLocale } from 'src/utils/locale/utils';

const labelStyle = {
  color: middleGrey,
  width: 100,
  display: 'inline-block',
  textAlign: 'right',
};
const componentStyle = {
  display: 'inline-block',
  marginLeft: 10,
  verticalAlign: 'top',
  maxWidth: 1000,
  overflowWrap: 'break-word',
};
const containerStyle = {
  margin: '20px 0 20px 20px',
};
const Item = (props: { label: string, content: any, intl: any }) => {
  const { label, content, intl } = props;

  return (
    <div style={containerStyle}>
      <div style={labelStyle}>{typeof label === 'string' ? changeChineseToLocale(label, intl) : label}</div>
      <div style={componentStyle}> {content || replaceSign} </div>
    </div>
  );
};

export default injectIntl(Item);
