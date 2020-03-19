// @flow

import React, { Component } from 'react';
import { error, white } from 'src/styles/color';
import { Icon, Popconfirm } from 'components';

export const REDUCE_SIZE = 14;

const baseContainerStyle = {
  width: REDUCE_SIZE,
  height: REDUCE_SIZE,
  fontSize: `${REDUCE_SIZE}px`,
  color: error,
};


export type Props = {
  style?: {},
  reduceClick: () => {} // 需要在这个函数中改变数据重新渲染。
};

class Reduce extends Component<Props, {}> {

  static REDUCE_SIZE: number = REDUCE_SIZE

  handleReduceClick = (props: Props, e: any) => {
    e.stopPropagation();
    const { reduceClick } = props;
    if (reduceClick) {
      reduceClick();
    }
  }


  render(): any {
    const { style } = this.props;

    return (
      <div style={style}>
        <Popconfirm
          title={'确定要删除该工序吗?'}
          okText={'确定删除'}
          okType={'暂不删除'}
          onConfirm={(e: any): void => this.handleReduceClick(this.props, e)}
        >
          <div
            style={{ ...baseContainerStyle, cursor: 'pointer' }}
          >
            <Icon style={{ background: white, borderRadius: '50%' }} type={'minus-circle'} />
          </div>
        </Popconfirm>
      </div>
    );
  }

}

export default Reduce;
