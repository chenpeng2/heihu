import React from 'react';
import { getStorageChildren } from 'services/knowledgeBase/storage';
import { TreeSelect } from 'antd';

class WorkStorageSelect extends React.PureComponent<any> {
  state = {
    treeData: [],
  };

  componentDidMount() {
    if (this.props.code) {
      this.setTreeNode(this.props.code);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.code && nextProps.code !== this.props.code) {
      this.setTreeNode(nextProps.code);
    }
  }

  setTreeNode = async code => {
    const { data: { data } } = await getStorageChildren(code);
    const treeData = data
      ? data.map(({ name, children, code, id }) => ({
          title: name,
          value: id,
          key: code,
          disabled: true,
          children:
            children &&
            children.map(({ name, code, id }) => ({
              title: name,
              value: id,
              key: code,
            })),
        }))
      : [];
    this.setState({ treeData });
  };

  render() {
    const { treeData } = this.state;
    const props = {
      labelInValue: true,
      treeData,
      treeCheckable: true,
      style: {
        width: 200,
      },
    };
    const value = this.props.value ? [...this.props.value] : [];
    return <TreeSelect {...props} {...this.props} value={value} />;
  }
}

export default WorkStorageSelect;
