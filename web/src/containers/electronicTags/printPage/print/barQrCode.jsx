import React, { Component } from 'react';

import { QRCode } from 'src/components';
import { black, white, border } from 'src/styles/color';

const DEFAULT_SIZE = 190;
const DEFAULT_MARGIN = 20;
const TEXT_HEIGHT = 20;

type Props = {
  style: {},
  length: number,
  height: number,
  levelMargin: number,
  verticalMargin: number,
  value: string,
};

class BarQrCode extends Component {
  state = {};
  props: Props;

  getQrCodeSize = () => {
    const { height, length, levelMargin, verticalMargin } = this.props;

    const _levelMargin = levelMargin || DEFAULT_MARGIN;
    const _verticalMargin = verticalMargin || DEFAULT_MARGIN;
    const _length = length || DEFAULT_SIZE;
    const _height = height || DEFAULT_SIZE + TEXT_HEIGHT;

    const _width = _length - _levelMargin * 2;
    const _high = _height - _verticalMargin * 2;

    return Math.min(_width, _high);
  };

  render() {
    const { value, height, length, levelMargin, verticalMargin } = this.props;

    const qrCodeSize = this.getQrCodeSize();

    return (
      <div
        style={{
          border: `1px solid ${border}`,
          display: 'inline-block',
          background: white,
          minHeight: height || DEFAULT_SIZE + TEXT_HEIGHT,
          width: length || DEFAULT_SIZE,
          padding: `${verticalMargin || DEFAULT_MARGIN}px ${levelMargin || DEFAULT_MARGIN}px`,
        }}
      >
        <QRCode value={value} size={qrCodeSize} />
        <div
          style={{
            color: black,
            fontSize: 18,
            textAlign: 'center',
            wordWrap: 'break-word',
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
          }}
        >
          {value}
        </div>
      </div>
    );
  }
}

export default BarQrCode;
