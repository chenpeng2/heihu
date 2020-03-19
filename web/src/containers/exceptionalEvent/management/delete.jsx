import React, { Component } from 'react';

import { message, Popconfirm, FormattedMessage } from 'src/components';
import { deleteEvent } from 'src/services/exceptionalEvent';
import { primary } from 'src/styles/color';

type Props = {
  style: {},
  id: string,
  fetchData: () => {},
};

class Delete extends Component {
  props: Props;
  state = {};

  render() {
    const { style, id, fetchData } = this.props;

    return (
      <Popconfirm
        onConfirm={() => {
          if (!id) return;
          deleteEvent(id).then(() => {
            message.success('删除异常事件成功');
            if (typeof fetchData === 'function') fetchData();
          });
        }}
        cancelText={'暂不删除'}
        okText={'确定删除'}
        title={'确定要删除该异常事件，删除后该异常事件将从所有移动端或看板上移除?'}
        overlayStyle={{ width: 254 }}
      >
        <FormattedMessage defaultMessage={'删除'} style={{ color: primary, cursor: 'pointer', ...style }} />
      </Popconfirm>
    );
  }
}

export default Delete;
