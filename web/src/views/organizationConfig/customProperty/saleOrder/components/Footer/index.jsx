import React from 'react';
import { Button } from 'components';
import styles from './index.scss';

type Props = {
  onCancel: () => void,
  onConfirm: () => void,
};

const Footer = (props: Props) => {
  const { onCancel, onConfirm } = props;
  return (
    <div className={styles.footer}>
      <Button type="default" className={styles.button} onClick={onCancel}>
        取消
      </Button>
      <Button type="primary" className={`${styles.button} ${styles.buttonSpace}`} onClick={onConfirm}>
        确定
      </Button>
    </div>
  );
};

export default Footer;
