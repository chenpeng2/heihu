import React, { Component } from 'react';

import { Input, Button, Icon, FormItem } from 'src/components';
import { warning, black } from 'src/styles/color';

const EnSureForClearQrcode = props => {
  const { amount, onClose } = props;

  return (
    <div>
      <div style={{ display: 'flex', padding: 20 }}>
        <Icon type={'info-circle'} style={{ color: warning }} size={40} />
        <div style={{ marginLeft: 5 }}>
          <div style={{ color: black, fontSize: 20 }}>清空确认</div>
          <span>
            您将清空
            {amount || 0}
            条的二维码数据，清空的数据无法返回，是否确认？
          </span>
        </div>
      </div>
      <FormItem style={{ marginLeft: 45 }} label={'清空原因'}>
        <Input disabled style={{ width: 300 }} value={'二维码清空/BL003'} />
      </FormItem>
    </div>
  );
};

export default EnSureForClearQrcode;
