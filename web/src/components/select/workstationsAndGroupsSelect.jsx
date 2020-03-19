// 可以选择工位组，同时当工位组没有子工位的时候disable
// 过滤了停用中的工位

import * as React from 'react';
import { getWorkStationGroup } from 'src/services/knowledgeBase';
import { TreeSelect } from 'antd';

type propsType = {
  onChange: () => {},
};

class WorkStationsAndGroupSelect extends React.Component<propsType> {
  state = {
    treeData: [],
  };

  componentDidMount() {
    this.setTreeData();
  }

  setTreeData = async () => {
    const { data } = await getWorkStationGroup();
    const treeData = data.data.map(node => {
      const children = node.workstations.filter(item => item && item.status === 1).map(ws => ({
        label: ws.name,
        key: `${node.id}-${ws.id}`,
        value: ws.id,
      }));

      return {
        label: node.name,
        value: `parent-${node.id}`,
        key: node.id,
        disabled: !node.workstations || children.length === 0,
        children,
      };
    });
    this.setState({ treeData });
  };

  render() {
    const { treeData } = this.state;
    return (
      <TreeSelect
        placeholder={'请选择'}
        treeData={treeData}
        treeCheckable
        allowClear
        treeNodeFilterProp="label"
        {...this.props}
      />
    );
  }
}

export default WorkStationsAndGroupSelect;
