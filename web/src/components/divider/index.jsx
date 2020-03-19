import React, { Component } from 'react';
import { borderGrey, darkGrey } from 'src/styles/color/index';

/**
 * @api {Divider} 分割线.
 * @APIGroup Divider.
 * @apiParam {Boolean} needLeftIcon 是否需要左侧icon.
 * @apiParam {Boolean} needRightIcon 是否需要右侧icon.
 * @apiParam {String} lineType line的类型,值为'solid'或'dashed',不传默认为dashed.
 * @apiParam {Obj} lineStyle -
 * @apiParam {Obj} style -
 * @apiExample {js} Example usage:
 * <Divider
    lineType={"solid"}
    needLeftIcon
    needRightIcon
   />
 */

const iconStyle = {
  width: 5,
  height: 5,
  background: darkGrey,
  transform: 'rotate(45deg)',
};

type Props = {
  style: any,
  lineStyle: any,
  needLeftIcon: boolean,
  needRightIcon: boolean,
  lineType: 'solid' | 'dashed',
  lineColor: String,
};

class Divider extends Component {
  props: Props;

  state = {};

  render() {
    const { style, lineStyle, needLeftIcon, needRightIcon, lineType, lineColor } = this.props;
    const defaultLineStyle = {
      width: '100%',
      height: 1,
      borderBottom: `1px ${lineType || 'dashed'} ${lineColor || borderGrey}`,
      verticalAlign: 'middle',
      padding: '2px 0 0 0',
    };
    return (
      <div style={{ display: 'flex', flexDirection: 'row', ...style }}>
        {needLeftIcon && <div style={iconStyle} />}
        <div style={{ ...defaultLineStyle, ...lineStyle }} />
        {needRightIcon && <div style={iconStyle} />}
      </div>
    );
  }
}

export default Divider;
