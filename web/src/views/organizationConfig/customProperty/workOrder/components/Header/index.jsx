import React from 'react';
import { black } from 'styles/color';
import styles from './index.scss';

type Props = {
  title: String,
  action: any,
};

const Header = (props: Props) => {
  const { action, title } = props;
  const titleStyle = { color: black };
  return (
    <div className={styles.header}>
      <div className={styles.title} style={titleStyle}>
        {title}
      </div>
      {action}
    </div>
  );
};

export default Header;
