import React from 'react';
import { Button } from 'antd';
import styles from './index.scss';

const Footer = ({ onCancel, onConfirm }) => {
  return (
    <div className={styles.footer}>
      <Button type="ghost" onClick={onCancel} className={styles.footerButton}>
        取消
      </Button>
      <Button type="primary" onClick={onConfirm} className={styles.footerButton}>
        确定
      </Button>
    </div>
  );
};

export default Footer;
