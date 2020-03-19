import React from 'react';
import { Popconfirm } from 'antd';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import Popiknow from './popiknow';
import PopConfirmWithCustomButton from './popConfirmWithCustomButton';

/**
 * @api {Popconfirm} 气泡确认框.
 * @APIGroup Popconfirm.
 * @apiExample {js} Example usage:
 * 详情见antd的Popconfirm
 */

const PopconfirmWithIntl = injectIntl(props => {
  const { title, okText, cancelText, intl, ...rest } = props;
  return (
    <Popconfirm
      title={typeof title === 'string' ? changeChineseToLocale(title, intl) : title}
      okText={typeof okText === 'string' ? changeChineseToLocale(okText, intl) : okText}
      cancelText={typeof cancelText === 'string' ? changeChineseToLocale(cancelText, intl) : cancelText}
      {...rest}
    />
  );
});

PopconfirmWithIntl.Popiknow = Popiknow;
PopconfirmWithIntl.PopConfirmWithCustomButton = PopConfirmWithCustomButton;

export default PopconfirmWithIntl;
