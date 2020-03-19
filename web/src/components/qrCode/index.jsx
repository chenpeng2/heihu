import React, { Component } from 'react';
import QRCode from 'qrcode.react';

type Props = {
  style: {}
}

class MyQRCode extends Component {
  state = {}
  props: Props

  render() {
    return (
      <QRCode {...this.props} />
    );
  }
}

export default MyQRCode;
