import React, { Component } from 'react';
import { deepGrey, white } from '../../styles/color/index';
import Triangle from '../triangle';

/**
 * @api {Label} Label.
 * @APIGroup Label.
 * @apiParam {String} backgroundColor 背景颜色,不传默认为deepGrey.
 * @apiParam {String} text 要展示的信息.
 * @apiParam {React.node} children 不传text传children就展示children.
 * @apiParam {Obj} style 最外层div的样式.
 * @apiParam {Obj} labelStyle 标签的样式.
 * @apiExample {js} Example usage:
 * <Label
    style={sectionStyle}
    labelStyle={{ color: darkGrey }}
    backgroundColor={sliverGrey}
    text="后序物流"
   >
 */

type Props = {
  text: String,
  children: any,
  labelStyle: any,
  style: any,
  backgroundColor: string,
}

const defaultStyle = {
  marginRight: 10,
  display: 'inline-block',
};

const defaultLabelStyle = {
  padding: '0 10px 0 10px',
  display: 'inline-block',
  minWidth: 70,
  height: 20,
  lineHeight: '20px',
  backgroundColor: deepGrey,
  color: white,
  borderRadius: '4px 0 0 4px',
  textAlign: 'left',
};

class Label extends Component {

  props: Props
  state = {}

  render() {
    const { text, children, backgroundColor, style, labelStyle } = this.props;
    const _backgroundColor = backgroundColor || deepGrey;
    return (
      <div style={{ ...defaultStyle, ...style }}>
        <div>
          <span
            style={{
              ...defaultLabelStyle,
              ...labelStyle,
              backgroundColor: _backgroundColor,
            }}
          >{text || children}</span>
          <Triangle color={_backgroundColor} />
        </div>
      </div>
    );
  }
}

export default Label;
