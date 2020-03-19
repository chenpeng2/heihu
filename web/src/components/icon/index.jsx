import React from 'react';
import { Tooltip, Icon as AntIcon } from 'antd';
import PropTypes from 'prop-types';

import { error } from 'src/styles/color';
import Avatar from './avatar';
import './styles.scss';

/**
 * @api {Icon} 图标.
 * @APIGroup Icon.
 * @apiParam {String} type 用来拼成图标的className.
 * @apiParam {String} iconType 默认使用antd的icon。需要使用gcicon要加上iconType = 'gc'.
 * @apiParam {String} className 用来拼成图标的className.
 * @apiParam {Number} size icon的大小,不传为默认值.
 * @apiParam {String} color icon的颜色,不传为默认值.
 * @apiParam {Obj} style icon的样式.
 * @apiExample {js} Example usage:
 * <Icon
    style={deleteIconStyle}
    color={'#0DC7A3'}
    size={12}
    type="minus-square-o"
   />
 */

const Icon = ({ color, size, className, type, style, iconType, tooltip, ...rest }) => {
  const iconStyle = {
    ...style,
  };
  if (size) {
    iconStyle.fontSize = size;
  }
  if (color) {
    if (color === 'none') {
      delete iconStyle.color;
    } else {
      iconStyle.color = color;
    }
  }
  if (iconType === 'gc') {
    return (
      <Tooltip
        placement={tooltip.placement}
        title={tooltip.content}
        arrowPointAtCenter
        getPopupContainer={tooltip.getPopupContainer}
      >
        <i
          style={Object.assign({}, { paddingRight: 8, lineHeight: 1 }, iconStyle)}
          className={`iconfont icon-${type} ${className}`}
          {...rest}
        />
      </Tooltip>
    );
  }
  return (
    <Tooltip
      placement={tooltip.placement}
      title={tooltip.content}
      arrowPointAtCenter
      getPopupContainer={tooltip.getPopupContainer}
    >
      <AntIcon style={iconStyle} className={className} type={type} {...rest} />
    </Tooltip>
  );
};

Icon.Avatar = Avatar;

Icon.propTypes = {
  type: PropTypes.string,
  style: PropTypes.shape(),
  className: PropTypes.string,
  color: PropTypes.string,
  tooltip: PropTypes.object,
  size: PropTypes.number,
  iconType: PropTypes.string,
};

Icon.defaultProps = {
  iconType: 'Icon',
  tooltip: {
    placement: 'top',
    content: '',
    getPopupContainer: () => document.body,
  },
};

export default Icon;
