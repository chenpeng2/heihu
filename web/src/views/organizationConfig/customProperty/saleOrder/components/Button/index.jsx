import React from 'react';
import { Icon } from 'components';
import { primary } from 'styles/color';
import styles from './index.scss';

type Props = {
  iconType: String,
  title: String,
  onClick: () => void,
};

const Button = (props: Props) => {
  const { iconType, title, onClick } = props;
  const buttonStyle = { color: primary };
  return (
    <div className={styles.action} style={buttonStyle} onClick={onClick}>
      <Icon type={iconType} />
      <span className={styles.title}>{title}</span>
    </div>
  );
};

export default Button;
