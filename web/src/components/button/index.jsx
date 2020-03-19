// @flow
import * as React from 'react';
import { Button } from 'antd';
import { injectIntl } from 'react-intl';
import localStorage from 'utils/localStorage';
import { FIELDS } from 'src/constants';
import { primary } from 'styles/color';
import classNames from 'classnames';
import { changeChineseToLocale } from 'src/utils/locale/utils';

import Icon from '../icon';
import styles from './index.scss';

/**
 * @api {Button} 按钮.
 * @APIGroup Button.
 * @apiParam {Obj} style - 不传有个默认样式
 * @apiExample {js} Example usage:
 * <Button style={{...}}/>
 * 详情参见antd的Button
 */

const myButton = (props: {
  iconType: string,
  icon: string,
  style: any,
  type: string,
  className: string,
  size: string,
  disabled: boolean,
  auth: string,
  children: any,
  intl: any,
}): React.Node => {
  const { intl, style, type, className, size, disabled, auth, iconType, icon, children, onClick, ...rest } = props;
  const disabledStyle = { cursor: 'not-allowed', opacity: 0.3 };
  let shouldDisable = disabled;
  if (auth) {
    shouldDisable = localStorage.get(FIELDS.AUTH).includes(auth) ? disabled : true;
  }

  const buttonProps = {
    type: type || 'primary',
    style: shouldDisable ? { ...style, ...disabledStyle } : style,
    size,
    className: classNames(styles.button, className, size === 'small' && styles.buttonSm),
    onClick: shouldDisable ? () => {} : onClick,
  };

  if (iconType === 'gc') {
    return (
      <Button {...buttonProps} {...rest}>
        <Icon type={icon} iconType={iconType} />
        {typeof children === 'string' ? changeChineseToLocale(children, intl) : children}
      </Button>
    );
  }

  return (
    <Button {...buttonProps} icon={icon} {...rest}>
      {typeof children === 'string' ? changeChineseToLocale(children, intl) : children}
    </Button>
  );
};

myButton.AntButton = Button;

export default injectIntl(myButton);
