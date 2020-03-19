import React from 'react';
import { Spin } from 'antd';

/**
 * @api {Spin} 加载中.
 * @APIGroup Spin.
 * @apiExample {js} Example usage:
 * 详情见antd的Spin
 */

const spin = (props: any) => (
  <Spin {...props} />
);

export default spin;
