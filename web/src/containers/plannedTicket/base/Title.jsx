import React from 'react';
import { Text } from 'components';

import styles from '../styles.scss';

type PropsType = {
  children: any,
};

export default function Title(props: PropsType) {
  const { children, ...restProps } = props || {};
  if (!children) return null;
  return (
    <p className={styles.title} {...restProps}>
      <Text>{children}</Text>
    </p>
  );
}
