import React from 'react';
import { Icon, Popconfirm } from 'components';

type Props = {
  onConfirm: () => void,
};

const DeleteButton = (props: Props) => {
  const { onConfirm } = props;
  return (
    <div style={{ marginBottom: 5 }}>
      <Popconfirm
        title="删除字段后，销售订单中该物料的所有数据都会丢失，确定删除吗？"
        onConfirm={onConfirm}
        okText="确定"
        cancelText="暂不删除"
      >
        <Icon type="minus-circle" />
      </Popconfirm>
    </div>
  );
};

export default DeleteButton;
