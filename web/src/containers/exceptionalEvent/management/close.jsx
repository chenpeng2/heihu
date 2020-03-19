import React, { Component } from 'react';

import { message, Popconfirm, FormattedMessage } from 'src/components';
import { updateEventStatus } from 'src/services/exceptionalEvent';
import { primary } from 'src/styles/color';

type Props = {
  style: {},
  id: string,
  fetchData: () => {},
};

class Close extends Component {
  props: Props;
  state = {};

  render() {
    const { style, id, fetchData } = this.props;

    return (
      <Popconfirm
        onConfirm={() => {
          if (!id) return;
          updateEventStatus(id, { status: 2 }).then(() => {
            message.success('关闭异常事件成功');
            if (typeof fetchData === 'function') fetchData();
          });
        }}
        cancelText={'取消'}
        okText={'关闭'}
        title={'确定要关闭该异常事件?'}
        overlayStyle={{ width: 254 }}
      >
          <FormattedMessage style={{ color: primary, cursor: 'pointer', ...style }} defaultMessage={'关闭'} />
      </Popconfirm>
    );
  }
}

export default Close;
