import React, { Component } from 'react';
import { TreeSelect } from 'src/components';

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

type Props = {
  treeData: [],
  form: any,
};

class WorkstationSelect extends Component {
  props: Props;
  state = {};

  render() {
    const { treeData, ...rest } = this.props;
    const tProps = {
      treeData: treeData ? [...treeData] : [],
      treeCheckable: true,
      showCheckedStrategy: SHOW_PARENT,
      searchPlaceholder: '选择工位',
      treeDefaultExpandAll: true,
      style: {
        width: 200,
      },
      labelInValue: false,
    };
    if (!treeData || (Array.isArray(treeData) && !treeData[0])) {
      // 没有这个判断会造成treeSelect报错
      tProps.value = [];
    }
    return <TreeSelect {...rest} {...tProps} treeCheckStrictly key={JSON.stringify(treeData)} />;
  }
}

export default WorkstationSelect;
