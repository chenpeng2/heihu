import React, { Component } from 'react';
import { blacklakeGreen } from 'src/styles/color/index';

/**
 * @api {ItemHeader} ItemHeader.
 * @APIGroup ItemHeader.
 * @apiParam {String} title 信息展示.
 * @apiParam {any} left 左面的空白,不传默认为'4%'.
 * @apiParam {any} titleSize 展示信息的字体大小.
 * @apiExample {js} Example usage:
 * <ItemHeader title={'前序计划'} style={itemHeaderStyle} />
 */

const defaultStyle = {
  backgroundColor: blacklakeGreen,
  width: 5,
  height: 18,
  marginRight: 6,
};

type PropsType = {
  title: ?string,
  style: ?any,
  titleSize: ?any,
  extraElement: any,
};

class ItemHeader extends Component<PropsType, {}> {
  state = {};

  render() {
    const { title, style, titleSize, extraElement } = this.props;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginLeft: 20,
          ...style,
        }}
      >
        <div style={{ ...defaultStyle }} />
        <div style={{ fontSize: titleSize || 16, height: 20, lineHeight: '20px' }}>{title}</div>
        {extraElement}
      </div>
    );
  }
}

export default ItemHeader;
