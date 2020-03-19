import React, { Component } from 'react';

import { message, Popconfirm, FormattedMessage } from 'src/components';
import { deleteSubject } from 'src/services/knowledgeBase/exceptionalEvent';
import { primary } from 'src/styles/color';

type Props = {
  style: {},
  id: string,
  fetchData: () => {},
  data: {},
};

class DeleteType extends Component {
  props: Props;
  state = {};

  render() {
    const { style, id, fetchData, data } = this.props;
    const { internal } = data || {};

    // 内置的主题不可删除
    if (internal) return null;

    return (
      <Popconfirm
        onConfirm={() => {
          if (!id) return;
          deleteSubject(id).then(() => {
            message.success('删除异常主题成功');
            if (typeof fetchData === 'function') fetchData();
          });
        }}
        cancelText={'暂不删除'}
        okText={'确定删除'}
        title={'确定要删除该异常事件的主题，删除后无法恢复?'}
        overlayStyle={{ width: 254 }}
      >
        <FormattedMessage defaultMessage={'删除'} style={{ color: primary, cursor: 'pointer', ...style }} />
      </Popconfirm>
    );
  }
}

export default DeleteType;
