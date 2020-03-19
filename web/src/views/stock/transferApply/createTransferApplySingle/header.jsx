import React from 'react';
import { black } from 'styles/color/index';
import styles from './styles.scss';

const Header = () => {
  const style = { color: black };
  return (
    <div className={styles.header} style={style}>
      创建转移申请
    </div>
  );
};

export default React.memo(Header);
