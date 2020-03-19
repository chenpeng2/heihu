import React, { Component } from 'react';

import { message, Popconfirm, FormattedMessage } from 'src/components';
import { deleteType } from 'src/services/knowledgeBase/exceptionalEvent';
import { primary } from 'src/styles/color';

type Props = {
  style: {},
  typeId: string,
  fetchData: () => {},
  data: {},
};

class DeleteType extends Component {
  props: Props;
  state = {};

  render() {
    const { style, typeId, fetchData, data } = this.props;
    const { internal } = data || {};

    // 内置类型不可删除
    if (internal) return null;

    return (
      <Popconfirm
        onConfirm={() => {
          if (!typeId) return;
          deleteType(typeId).then(() => {
            message.success('删除异常类型成功');
            if (typeof fetchData === 'function') fetchData();
          });
        }}
        cancelText={'暂不删除'}
        okText={'确定删除'}
        title={'确定要删除该异常事件的类型，删除后无法恢复?'}
        overlayStyle={{ width: 254 }}
      >
        <FormattedMessage style={{ color: primary, cursor: 'pointer', ...style }} defaultMessage={'删除'} />
      </Popconfirm>
    );
  }
}

export default DeleteType;
