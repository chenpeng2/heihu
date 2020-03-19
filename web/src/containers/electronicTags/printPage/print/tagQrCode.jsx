import React, { Component } from 'react';

import { QRCode, FormattedMessage } from 'src/components';
import { black, white, border } from 'src/styles/color';
import { replaceSign } from 'src/constants';

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 170;
const DEFAULT_MARGIN = 20;
const TEXT_HEIGHT = 20;

type Props = {
  style: {},
  length: number,
  height: number,
  levelMargin: number,
  verticalMargin: number,
  value: string,
  info: {},
};

class TagQrCode extends Component {
  state = {};
  props: Props;

  getSize = () => {
    const { length, levelMargin } = this.props;

    const _levelMargin = levelMargin || DEFAULT_MARGIN;
    const _length = length || DEFAULT_WIDTH;

    const _width = _length - _levelMargin * 2 - 10 - DEFAULT_MARGIN;

    return {
      qrCodeSize: (100 / 265) * _width,
      projectInfoSize: (165 / 265) * _width,
    };
  };

  renderProjectInfo = () => {
    const { info } = this.props;
    const { projectCode, productCode, productName, productAmount, productBatchSeq } = info || {};

    const contentStyle = {
      wordWrap: 'break-word',
      overflow: 'hidden',
      whiteSpace: 'pre-wrap',
    };
    const containerStyle = {
      display: 'flex',
    };
    const titleStyle = {
      whiteSpace: 'nowrap',
      // width: 300,
    };

    return (
      <div>
        <div style={containerStyle}>
          <FormattedMessage style={titleStyle} defaultMessage={'项目编号'} />
          <span>：</span>
          <span style={contentStyle}>{projectCode || replaceSign}</span>
        </div>
        <div style={containerStyle}>
          <FormattedMessage style={titleStyle} defaultMessage={'产品编号'} />
          <span>：</span>
          <span style={contentStyle}>{productCode || replaceSign}</span>
        </div>
        <div style={containerStyle}>
          <FormattedMessage style={titleStyle} defaultMessage={'产品名称'} />
          <span>：</span>
          <span style={contentStyle}>{productName || replaceSign}</span>
        </div>
        <div style={containerStyle}>
          <FormattedMessage style={titleStyle} defaultMessage={'产品数量'} />
          <span>：</span>
          <span style={contentStyle}>{productAmount || replaceSign}</span>
        </div>
        <div style={containerStyle}>
          <FormattedMessage style={titleStyle} defaultMessage={'产品批次'} />
          <span>：</span>
          <span style={contentStyle}>{productBatchSeq || replaceSign}</span>
        </div>
      </div>
    );
  };

  render() {
    const { value, height, length, levelMargin, verticalMargin } = this.props;

    const { qrCodeSize, projectInfoSize } = this.getSize();

    return (
      <div
        style={{
          border: `1px solid ${border}`,
          display: 'inline-block',
          background: white,
          minHeight: height || DEFAULT_HEIGHT + TEXT_HEIGHT,
          width: length || DEFAULT_WIDTH,
          padding: `${verticalMargin || DEFAULT_MARGIN}px ${levelMargin || DEFAULT_MARGIN}px`,
          overflow: 'hidden',
          wordWrap: 'break-word',
        }}
      >
        <div>
          <div style={{ display: 'inline-block' }}>
            <QRCode value={value} size={qrCodeSize} />
          </div>
          <div
            style={{
              width: projectInfoSize,
              display: 'inline-block',
              marginLeft: DEFAULT_MARGIN,
              verticalAlign: 'top',
            }}
          >
            {this.renderProjectInfo()}
          </div>
        </div>
        <div
          style={{
            color: black,
            fontSize: 18,
            textAlign: 'left',
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

export default TagQrCode;
