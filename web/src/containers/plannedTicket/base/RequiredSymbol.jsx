import React from 'react';
import classNames from 'classnames';

import styles from '../styles.scss';

export default function RequiredSymbol() {
  return <i className={classNames(styles['table-column-title-prefix'], styles['required-symbol'])} />;
}
