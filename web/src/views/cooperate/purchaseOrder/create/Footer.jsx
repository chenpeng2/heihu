import React from 'react';
import { Button } from 'components';

type Props = {
  onCancel: () => void,
  onSave: () => void,
};

const Footer = (props: Props) => {
  const { onCancel, onSave } = props;
  const containerStyle = { marginLeft: 120, marginTop: 30, marginBottom: 50 };
  const buttonStyle = { marginRight: 60, width: 114 };
  return (
    <div style={containerStyle}>
      <Button type="default" style={buttonStyle} onClick={onCancel}>
        取消
      </Button>
      <Button style={buttonStyle} onClick={onSave}>
        提交
      </Button>
    </div>
  );
};

export default Footer;
