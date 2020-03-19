import React from 'react';
import { Button } from 'components';
import styles from './index.scss';

type Props = {
  disabled: Boolean,
  onCancel: () => void,
  onSave: () => void,
};

function Footer(props: Props) {
  const { disabled, onCancel, onSave } = props;
  const cancelBtn = { width: 114, height: 32, marginRight: 72 };
  const confirmBtn = { width: 114, height: 32 };
  return (
    <div className={styles.footer}>
      <Button type="default" style={cancelBtn} onClick={onCancel}>
        取消
      </Button>
      <Button disabled={disabled} style={confirmBtn} onClick={onSave}>
        保存
      </Button>
    </div>
  );
}

export default React.memo(Footer);
