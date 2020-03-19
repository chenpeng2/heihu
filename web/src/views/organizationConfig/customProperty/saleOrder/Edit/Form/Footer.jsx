import React from 'react';
import { Icon } from 'components';
import { primary, fontSub } from 'styles/color';

type Props = {
  onAdd: () => void,
};

const Footer = (props: Props) => {
  const { onAdd } = props;
  return (
    <div>
      <div style={{ color: primary, cursor: 'pointer', display: 'inline-block' }} onClick={onAdd}>
        <Icon type="plus-circle-o" style={{ verticalAlign: 'text-bottom' }} />
        <span style={{ marginLeft: 5 }}>添加字段</span>
      </div>
      <span style={{ color: fontSub, marginLeft: 10 }}>最多支持10个自定义字段</span>
    </div>
  );
};

export default Footer;
