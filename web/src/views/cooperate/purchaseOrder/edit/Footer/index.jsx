import React from 'react';
import { Button } from 'src/components';

type Props = {
  onCancel: () => void,
  onSubmit: () => void,
};

function Footer(props: Props) {
  const { onCancel, onSubmit } = props;
  const containerStyle = { marginLeft: 120, marginBottom: 50 };
  const buttonStyle = { marginRight: 60, width: 114 };
  return (
    <div style={containerStyle}>
      <Button type="default" style={buttonStyle} onClick={onCancel}>
        取消
      </Button>
      <Button style={buttonStyle} onClick={onSubmit}>
        提交
      </Button>
    </div>
  );
}

export default Footer;
