import React, { Component } from 'react';
import _ from 'lodash';

import { Link, message, Popconfirm } from 'components';
import { cancelWeighingTask } from 'src/services/weighing/weighingTask';

const PopConfirmWithCustomButton = Popconfirm.PopConfirmWithCustomButton;

type Props = {
  id: any,
  code: String,
  style: {},
  iconRender: {},
  refetch: () => {},
};

class CancelLink extends Component {
  props: Props;
  state = {
    showPopConfirm: false,
  };

  cancelTask = async () => {
    const { id, refetch } = this.props;

    await cancelWeighingTask(id)
      .then(res => {
        const statusCode = _.get(res, 'data.statusCode');
        if (statusCode === 200) {
          message.success('取消成功');
          refetch();
        } else {
          message.error('取消失败');
        }
      })
      .catch(err => console.log(err));
  };

  render() {
    const { showPopConfirm } = this.state;
    const { code, iconRender, style, ...rest } = this.props;

    return (
      <PopConfirmWithCustomButton
        text={`取消称量任务${code}吗？`}
        onConfirm={async () => {
          await this.cancelTask();
          this.setState({ showPopConfirm: false });
        }}
        onCancel={() => {
          this.setState({ showPopConfirm: false });
        }}
        okText={'取消'}
        cancelText={'暂不取消'}
        visible={showPopConfirm}
        placement={'topRight'}
      >
        <Link
          icon={iconRender}
          style={{ marginLeft: 20, display: 'inline-block', ...style }}
          onClick={() => this.setState({ showPopConfirm: true })}
          {...rest}
        >
          取消
        </Link>
      </PopConfirmWithCustomButton>
    );
  }
}

export default CancelLink;
