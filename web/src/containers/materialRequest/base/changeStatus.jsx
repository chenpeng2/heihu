import React, { Component } from 'react';

import { Popconfirm, Icon } from 'src/components';
import { primary } from 'src/styles/color';
import { dispatchMaterialRequest, cancelMaterialRequest } from 'src/services/cooperate/materialRequest';

type Props = {
  code: string,
  style: {},
  statusNow: {},
  fetchData: () => {},
  type: 'cancle' | 'dispatch',
  iconType: string,
  isGcIcon: boolean,
  style: {},
};

class ChangeUseStatus extends Component {
  props: Props;
  state = {
    color: primary,
  };

  render() {
    const { color } = this.state;
    const { fetchData, code, type, iconType, isGcIcon, style } = this.props;

    if (type === 'cancel') {
      return (
        <Popconfirm
          title={`取消物料请求后无法再进行任何操作，确定取消物料请求${code}吗`}
          okText={'取消'}
          cancelText={'暂不取消'}
          onConfirm={() => {
            cancelMaterialRequest(code).then(() => {
              if (fetchData && typeof fetchData === 'function') fetchData();
            });
          }}
          style={style}
        >
          {iconType ? (
            <Icon
              style={{
                color,
                marginRight: 10,
                verticalAlign: 'middle',
                fontSize: '16px',
              }}
              type={iconType}
            />
          ) : null}
          <div
            style={{
              marginRight: 10,
              marginLeft: iconType ? 5 : 0,
              display: 'inline-block',
              color,
              cursor: 'pointer',
            }}
          >
            {'取消'}
          </div>
        </Popconfirm>
      );
    }

    if (type === 'dispatch') {
      return (
        <div
          onClick={() => {
            dispatchMaterialRequest(code).then(() => {
              if (fetchData && typeof fetchData === 'function') fetchData();
            });
          }}
          style={{
            marginRight: '10px',
            display: 'inline-block',
            color,
            cursor: 'pointer',
            ...style,
          }}
        >
          {iconType ? (
            <Icon
              iconType={isGcIcon ? 'gc' : null}
              type={iconType}
              style={{
                paddingRight: 0,
                marginRight: 10,
                verticalAlign: 'middle',
              }}
            />
          ) : null}
          <span>{'下发'}</span>
        </div>
      );
    }
  }
}

export default ChangeUseStatus;
