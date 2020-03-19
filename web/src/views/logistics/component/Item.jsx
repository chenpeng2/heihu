import React from 'react';
import classNames from 'classnames';
import styles from './item.scss';

const Item = ({ title, children, className, contentStyle, style }: any) => {
  return (
    <div className={classNames(styles.wrapper, className)} style={style}>
      <p className={styles.title}>{title}</p>
      <div className={styles.content} style={contentStyle}>{children}</div>
    </div>
  );
};

export default Item;
