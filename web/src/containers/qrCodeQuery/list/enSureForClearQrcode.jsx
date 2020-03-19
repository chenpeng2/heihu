import React, { Component } from 'react';

import { Button, Icon } from 'src/components';
import { warning, black } from 'src/styles/color';

const EnSureForClearQrcode = props => {
  const { amount, onClose } = props;

  return (
    <div>
      <div style={{ display: 'flex', padding: 20 }}>
        <Icon type={'info-circle'} style={{ color: warning }} size={40} />
        <div style={{ marginLeft: 5 }} >
          <div style={{ color: black, fontSize: 20 }}>清空确认</div>
          <span>
            您将清空
            {amount || 0}
            条的二维码数据，清空的数据无法返回，是否确认？
          </span>
        </div>
      </div>
    </div>
  );
};

export default EnSureForClearQrcode;
