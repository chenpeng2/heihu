import React from 'react';
import { Collapse } from 'antd';

/**
 * @api {Collapse} 折叠面板.
 * @APIGroup Collapse.
 * @apiExample {js} Example usage:
 * Collapse.Panel加了个collapseDefaultStyle,其他详情见antd的Collapse
 */

const CollapsePanel = Collapse.Panel;

export const collapseDefaultStyle = {
  background: 'white',
  border: 0,
};

export const Panel = (props) => {
  return <CollapsePanel style={collapseDefaultStyle} {...props} />;
};

Collapse.Panel = Panel;

export default Collapse;
