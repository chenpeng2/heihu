import React from 'react';
import { Button } from 'components';
import styles from './styles.scss';

type Props = {
  onCancel: () => void,
  onConfirm: () => void,
};

const Footer = (props: Props) => {
  const { onCancel, onConfirm } = props;
  return (
    <div className={styles.footer}>
      <Button className={styles.button} type="default" onClick={onCancel}>
        取消
      </Button>
      <Button className={styles.button} type="primary" style={{ marginLeft: 10 }} onClick={onConfirm}>
        确定
      </Button>
    </div>
  );
};

export default React.memo(Footer);
