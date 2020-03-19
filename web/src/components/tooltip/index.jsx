import React from 'react';
import { Tooltip as AntTooltip } from 'antd';
import { stringEllipsis2 } from 'utils/string';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import Link from '../link';
import styles from './styles.scss';

/**
 * @api {Tooltip} 文字提示.
 * @APIGroup Tooltip.
 * @apiExample {js} Example usage:
 * 详情见antd的Tooltip
 */

// text: 要显示的文字
// length: 需要省略的长度

const Tooltip = ({
  text: _text,
  length,
  containerStyle,
  width,
  onLink,
  linkProps,
  intl,
  closeIntl,
  ...restProps
}: {
  containerStyle: {},
  text: string,
  onLink: () => {},
  length: number,
  width: number,
  intl: any,
  closeIntl: boolean,
}) => {
  const text = closeIntl ? _text : changeChineseToLocale(_text, intl);
  if (restProps.title) {
    restProps.title = changeChineseToLocale(restProps.title, intl);
  }
  if (!text && !length && !width) {
    return <AntTooltip {...restProps} />;
  }
  if (text && length && text.length <= length) {
    return !onLink ? (
      <span style={containerStyle}>{text}</span>
    ) : (
      <Link onClick={onLink} {...linkProps}>
        {text}
      </Link>
    );
  }
  const overflowStyle = {
    maxWidth: width,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'inline-block',
    verticalAlign: 'middle',
  };
  return (
    <AntTooltip {...restProps} title={text}>
      {!onLink ? (
        <span className={styles.tooltip} style={width ? { ...overflowStyle, ...containerStyle } : containerStyle}>
          {width ? text : stringEllipsis2(text, length)}
        </span>
      ) : (
        <Link onClick={onLink} style={width ? { ...overflowStyle, ...containerStyle } : null} {...linkProps}>
          {width ? text : stringEllipsis2(text, length)}
        </Link>
      )}
    </AntTooltip>
  );
};

Tooltip.AntTooltip = AntTooltip;

export default injectIntl(Tooltip);
