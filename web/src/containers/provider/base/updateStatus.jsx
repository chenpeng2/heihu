import React, { Component } from 'react';

import { message, FormattedMessage } from 'src/components';
import { stopUseProvider, useProvider } from 'src/services/provider';

import { primary, error } from 'src/styles/color';
import { STATUS, STATUS_BTN } from '../constant';

type Props = {
  code: string,
  style: {},
  statusNow: {},
  fetchData: () => {},
};

class UpdateStatus extends Component {
  props: Props;
  state = {
    color: primary,
  };

  getNextStatus = statusNow => {
    if (!statusNow) return null;

    const { code } = statusNow;
    if (code === 0) return { code: 1, name: STATUS_BTN[1] };
    if (code === 1) return { code: 0, name: STATUS_BTN[0] };

    return null;
  };

  render() {
    const { color } = this.state;
    const { statusNow, fetchData, code: providerCode } = this.props;
    const nextStatus = this.getNextStatus(statusNow);

    const { name, code } = nextStatus || {};

    return (
      <div
        onClick={() => {
          const updateStatus = () => {
            if (code === 0) {
              return stopUseProvider(providerCode).then(() => {
                message.success('停用供应商成功');
              });
            }
            return useProvider(providerCode).then(() => {
              message.success('启用供应商成功');
            });
          };

          updateStatus()
            .then(() => {
              this.setState({ color: primary }, () => {
                if (fetchData && typeof fetchData === 'function') fetchData();
              });
            })
            .catch(e => {
              this.setState({ color: error });
              return e;
            });
        }}
        style={{ marginRight: '10px', display: 'inline-block', color, cursor: 'pointer' }}
      >
        <FormattedMessage defaultMessage={name} />
      </div>
    );
  }
}

export default UpdateStatus;
