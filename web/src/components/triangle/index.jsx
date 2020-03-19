/**
 * 三角形组件,负责三角形的渲染,接受尺寸，颜色和方向三个参数。具有默认值
 */
import React, { Component } from 'react';
import { deepGrey } from '../../styles/color/index';

/**
 * @api {Triangle} Traingle.
 * @APIGroup Triangle.
 * @apiParam {String} direction Traingle的方向,有四个值'up' | 'down' | 'right' | 'left',默认为'right'.
 * @apiParam {String} color Traingle的颜色,默认为deepGrey.
 * @apiParam {Number} size Traingle的大小,默认为10.
 * @apiParam {Obj} style Traingle的额外样式,不传有默认的.
 * @apiExample {js} Example usage:
 * <Triangle color={_backgroundColor} />
 */

type Props = {
  direction: 'up' | 'down' | 'right' | 'left',
  color: string,
  size: number,
  style: {}
}


class Triangle extends Component {
  props: Props

  state = {}

  getStyle = (direction = 'right', color = deepGrey, size = '10') => {
    const _style = `${size}px solid ${color}`;
    const _hideStyle = `${size}px solid transparent`;
    const triangleUp = {
      display: 'inline-block',
      verticalAlign: 'bottom',
      width: 0,
      height: 0,
      borderBottom: _style,
      borderRight: _hideStyle,
      borderLeft: _hideStyle,
    };
    const triangleDown = {
      verticalAlign: 'bottom',
      display: 'inline-block',
      width: 0,
      height: 0,
      borderTop: _style,
      borderRight: _hideStyle,
      borderLeft: _hideStyle,
    };
    const triangleLeft = {
      verticalAlign: 'bottom',
      display: 'inline-block',
      width: 0,
      height: 0,
      borderTop: _hideStyle,
      borderBottom: _hideStyle,
      borderRight: _style,
    };
    const triangleRight = {
      verticalAlign: 'bottom',
      display: 'inline-block',
      width: 0,
      height: 0,
      borderTop: _hideStyle,
      borderBottom: _hideStyle,
      borderLeft: _style,
    };
    const allStyle = {
      up: triangleUp,
      down: triangleDown,
      right: triangleRight,
      left: triangleLeft,
    };
    return allStyle[direction];
  }

  render() {
    const { direction, color, size, style } = this.props;
    return (
      <div style={{ ...this.getStyle(direction, color, size), ...style }} />
    );
  }
}

export default Triangle;
