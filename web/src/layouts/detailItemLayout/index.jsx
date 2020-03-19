import React from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { changeChineseToLocale } from 'src/utils/locale/utils';
import { middleGrey } from 'src/styles/color';
import { replaceSign } from 'src/constants';

import DetailPageTitleLayout from './DetailPageTitleLayout';

const DetailItemLayout = (props: { label: any, children: any, style: any }, context) => {
  const { label, children, style } = props;
  const { intl } = context;
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

  return (
    <div style={{ ...containerStyle, ...style }}>
      <div style={labelStyle}> {typeof label === 'string' ? changeChineseToLocale(label, intl) : label} </div>
      <div style={componentStyle}> { typeof children === 'string' ? changeChineseToLocale(children, intl) : children || replaceSign } </div>
    </div>
  );
};


DetailItemLayout.DetailPageTitleLayout = DetailPageTitleLayout;

DetailItemLayout.contextTypes = {
  intl: PropTypes.any,
};

export default injectIntl(DetailItemLayout);
