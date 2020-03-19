import React, { Component } from 'react';
import { AutoComplete as AntdAutoComplete } from 'antd';
import MaterialAutoComplete from './materialAutoComplete';

class AutoComplete extends Component {
  state = {};
  render() {
    return <AntdAutoComplete allowClear labelInValue filterOption={false} placeholder="请输入" {...this.props} />;
  }
}

AutoComplete.Option = AntdAutoComplete.Option;
AutoComplete.MaterialAutoComplete = MaterialAutoComplete;

export default AutoComplete;
