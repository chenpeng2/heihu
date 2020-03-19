import React from 'react';
import classNames from 'classnames';
import styles from './styles.scss';

export const nameShort = text => {
  if (!text) return '';
  if (typeof text !== 'string') return '';
  if (text.length < 1) return '';
  const regChinese = /[\u4e00-\u9fa5]/;
  let length = 0;
  let result = '';
  for (let index = 0; index < text.length; index += 1) {
    if (regChinese.test(text.charAt(index))) {
      if (length + 2 > 2) {
        break;
      } else {
        length += 2;
        result += text.charAt(index);
      }
    } else if (length + 1 > 2) {
      break;
    } else {
      length += 1;
      result += text.charAt(index);
    }
  }
  return result.trim().toLocaleUpperCase();
};

export default function Avatar({ name, color, className, style }: any) {
  return (
    <span className={classNames(styles.avatar, className)} style={{ background: color, ...style }}>
      {nameShort(name)}
    </span>
  );
}
