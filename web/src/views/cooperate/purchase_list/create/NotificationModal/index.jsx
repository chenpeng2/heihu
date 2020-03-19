import React from 'react';
import { Icon, Modal, Button, PlainText } from 'components';
import { primary } from 'styles/color';

const AntModal = Modal.AntModal;

type Props = {
  desc: String,
  visible: Boolean,
  onDone: () => void,
  onCancel: () => void,
};

function NotificationModal(props: Props) {
  const { onDone, desc, onCancel, visible } = props;
  const container_style = { display: 'inline-block' };
  return (
    <AntModal width={500} visible={visible} footer={null} onCancel={onCancel}>
      <div style={{ marginTop: 15 }}>
        <div style={container_style}>
          <Icon type={'check-circle'} style={{ fontSize: 36, color: primary }} />
        </div>
        <div style={{ ...container_style, marginLeft: 10 }}>
          <PlainText text="创建成功！" style={{ fontSize: 18 }} />
          <div>{desc}</div>
        </div>
        <div style={{ padding: '16px 0 15px 0', display: 'flex', justifyContent: 'center' }}>
          <Button type="default" onClick={onDone}>
            知道了
          </Button>
        </div>
      </div>
    </AntModal>
  );
}

export default NotificationModal;
