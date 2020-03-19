import React from 'react';
import { Cascader as AntCascader } from 'antd';

/**
 * 其他详情见antd的Cascader
 */

class Cascader extends React.Component {
  state = {};
  render() {
    return <AntCascader placeholder="请选择" {...this.props} />;
  }
}

export default Cascader;
