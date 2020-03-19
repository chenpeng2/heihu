import React, { Component } from 'react';

import { message } from 'src/components';
import { primary } from 'src/styles/color';
import { changeReasonStatus } from 'src/services/stock/qrCodeAdjustReason';

type Props = {
  style: {},
  statusNow: boolean,
  cbForChangeStatus: () => {},
  code: string,
};

class ChangeUseStatus extends Component {
  props: Props;
  state = {};

  render() {
    const { statusNow, cbForChangeStatus, code, style } = this.props;
    const nextStatusText = statusNow ? '停用' : '启用';

    const changeStatus = () => {
      changeReasonStatus(code, {
        enable: !statusNow,
      }).then(() => {
        message.success(`${nextStatusText}调整原因成功`);
        if (typeof cbForChangeStatus === 'function') cbForChangeStatus();
      });
    };

    return (
      <span onClick={changeStatus} style={{ color: primary, cursor: 'pointer', ...style }}>
        {nextStatusText}
      </span>
    );
  }
}

export default ChangeUseStatus;
