import React, { Component } from 'react';
import { white, middleGrey } from 'src/styles/color/index';

type Props = {
  text: string,
};

class AlertPage extends Component {
  props: Props;
  state = {};

  render() {
    const { text } = this.props;
    return (
      <div
        style={{
          background: white,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          alignContent: 'sapce-around',
        }}
      >
        <div
          style={{
            flex: 1,
            fontSize: 18,
            textAlign: 'center',
            color: middleGrey,
          }}
        >
          {text}
        </div>
      </div>
    );
  }
}

export default AlertPage;
