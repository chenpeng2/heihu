import React from 'react';
import { Button, buttonAuthorityWrapper } from 'components';
import styles from '../styles.scss';

const ButtonWithAuth = buttonAuthorityWrapper(Button);

type FooterProps = {
  cancelFn: () => void,
  submitFn: () => void,
  validateFunc: () => void,
  disabled: Boolean,
  submitLoading: Boolean,
};

export default function Footer(props: FooterProps) {
  const { submitFn, cancelFn, disabled, validateFunc, submitLoading } = props || {};
  return (
    <div className={styles['purchase-material-incoming-footer']}>
      <Button type="default" onClick={cancelFn}>
        取消
      </Button>
      <ButtonWithAuth
        loading={submitLoading}
        validateFunc={validateFunc}
        signConfigKey="procure_order_in"
        disabled={disabled}
        type="primary"
        onClick={submitFn}
        disabled={disabled}
      >
        保存
      </ButtonWithAuth>
    </div>
  );
}
