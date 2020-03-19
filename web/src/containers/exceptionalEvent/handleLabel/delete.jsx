import React, { Component } from 'react';

import { message, Popconfirm, FormattedMessage } from 'src/components';
import { deleteLabel } from 'src/services/knowledgeBase/exceptionalEvent';
import { primary } from 'src/styles/color';

type Props = {
  style: {},
  id: string,
  fetchData: () => {},
};

class DeleteType extends Component {
  props: Props;
  state = {};

  render() {
    const { style, id, fetchData } = this.props;

    return (
      <Popconfirm
        onConfirm={() => {
          if (!id) return;
          deleteLabel(id).then(() => {
            message.success('删除处理标签成功');
            if (typeof fetchData === 'function') fetchData();
          });
        }}
        cancelText={'暂不删除'}
        okText={'确定删除'}
        title={'确定要删除该异常事件的标签，删除后无法恢复?'}
        overlayStyle={{ width: 254 }}
      >
        <FormattedMessage style={{ color: primary, cursor: 'pointer', ...style }} defaultMessage={'删除'} />
      </Popconfirm>
    );
  }
}

export default DeleteType;
