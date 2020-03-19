import React from 'react';
import { Icon, Link } from 'components';
import './styles.scss';

type Props = {
  iconType: string,
  text: string,
  hover: boolean, // 是否需要hover样式
};

export default ({ iconType, text, ...rest }: Props) => {
  return (
    <Link {...rest} style={{ marginRight: 16 }}>
      {iconType === null ? null : <Icon type={iconType || 'plus'} style={{ fontSize: 12, marginRight: 4 }} />}
      <span>{text}</span>
    </Link>
  );
};
