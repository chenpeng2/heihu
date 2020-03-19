import React, { Component } from 'react';

import { message, Popconfirm, FormattedMessage } from 'src/components';
import { deleteSetting } from 'src/services/knowledgeBase/exceptionalEvent';
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
          deleteSetting(id).then(() => {
            message.success('删除订阅配置成功');
            if (typeof fetchData === 'function') fetchData();
          });
        }}
        cancelText={'暂不删除'}
        okText={'确定删除'}
        title={'确定要删除该订阅配置，删除后该用户／用户组将无法接受任何异常事件的提醒?'}
        overlayStyle={{ width: 254 }}
      >
        <FormattedMessage style={{ color: primary, cursor: 'pointer', ...style }} defaultMessage={'删除'} />
      </Popconfirm>
    );
  }
}

export default Delete;
