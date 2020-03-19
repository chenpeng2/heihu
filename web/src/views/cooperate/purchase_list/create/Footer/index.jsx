import React from 'react';
import { Button, FormItem } from 'components';

type Props = {
  onCancel: () => void,
  onConfirm: () => void,
};

function Footer(props: Props) {
  const { onCancel, onConfirm } = props;
  const containerStyle = { marginLeft: 120 };

  const buttonStyle = { marginRight: 60, width: 114 };
  return (
    <FormItem style={{ ...containerStyle, marginTop: 30 }}>
      <Button type="default" style={buttonStyle} onClick={onCancel}>
        取消
      </Button>
      <Button style={buttonStyle} onClick={onConfirm}>
        确认
      </Button>
    </FormItem>
  );
}

export default React.memo(Footer);
