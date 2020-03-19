import React, { Component } from 'react';
import { TreeSelect } from 'antd';

type Props = {
  treeData: [],
  form: any,
  style: {},
};

class WorkstationSelect extends Component {
  props: Props;
  state = {};

  render() {
    const { treeData, style, ...rest } = this.props;
    const tProps = {
      treeData: treeData ? [...treeData] : [],
      treeCheckable: true,
      showCheckedStrategy: TreeSelect.SHOW_CHILD,
      searchPlaceholder: '选择工位',
      treeDefaultExpandAll: true,
      style,
    };
    if (!treeData || (Array.isArray(treeData) && !treeData[0])) {
      // 没有这个判断会造成treeSelect报错
      tProps.value = [];
    }
    return <TreeSelect {...tProps} labelInValue key={JSON.stringify(treeData)} {...rest} />;
  }
}

export default WorkstationSelect;
