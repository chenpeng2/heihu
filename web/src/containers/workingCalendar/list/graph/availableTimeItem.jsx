import React, { Component } from 'react';

import { Popover } from 'src/components';
import { primary, black } from 'src/styles/color';


export const innerGreen = 'rgba(61, 210, 126)';

type Props = {
  style: {},
  data: {
    startTime: string,
    endTime: string,
  },
};

class AvailableTimeItem extends Component {
  props: Props;
  state = {
    deepBackground: false,
  };

  renderContent = () => {
    const { data } = this.props;
    const { startTime, endTime } = data || {};

    const commonItemStyle = { margin: '5px', paddingLeft: 30 };
    const timeStyle = { color: black, marginLeft: 10 };

    return (
      <div style={{ width: 200 }}>
        <div>
          <div style={{ background: innerGreen, width: 5, height: 5, display: 'inline-block', margin: 5 }} />
          <span style={{ color: black, fontSize: 16 }} >有效工作时间</span>
        </div>
        <div>
          <div style={commonItemStyle}>
            <span>开始时间</span>
            <span style={timeStyle} >{ startTime || '00:00' } </span>
          </div>
          <div style={commonItemStyle}>
             <span>结束时间</span>
             <span style={timeStyle} >{ endTime || '24:00' } </span>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { style } = this.props;

    return (
      <Popover
        content={this.renderContent()}
        trigger={'click'}
        onVisibleChange={(visible) => {
          this.setState({
            deepBackground: visible,
          });
        }}
      >
        <div
          style={{
            display: 'flex',
            background: this.state.deepBackground ? 'rgba(61, 210, 126, 1)' : 'rgba(61, 210, 126, 0.1)',
            ...style,
          }}
        >
          <div style={{ display: 'inline-block', background: primary, width: 2, height: 40, marginRight: 2 }} />
          <div
            style={{
              display: 'inline-block',
              flex: 1,
            }}
          />
        </div>
      </Popover>
    );
  }
}

export default AvailableTimeItem;
