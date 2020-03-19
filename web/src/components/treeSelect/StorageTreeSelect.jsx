import React from 'react';
import _ from 'lodash';
import { getStorageList } from 'services/knowledgeBase/storage';
import TreeSelect from './index';

class StorageTreeSelect extends React.PureComponent {
  state = {
    treeData: [],
  };

  componentDidMount() {
    this.setTreeData('');
    this.setState({ value: this.props.value });
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.value, nextProps.value)) {
      this.setState({ value: nextProps.value });
    }
  }

  setTreeData = async search => {
    console.log(search);
    const { level = 3, disabledParent = false } = this.props;
    const {
      data: {
        data: { data },
      },
    } = await getStorageList({ search });
    const treeData = data.map(({ code, id, name, children }) => {
      return {
        value: `${id}`,
        key: `${id}`,
        title: `${code}/${name}`,
        level: 0,
        disabled: disabledParent ? level > 1 : false,
        children:
          children &&
          level > 1 &&
          children.map(({ code, id, name, children }) => ({
            title: `${code}/${name}`,
            key: `${id}`,
            value: `${id}`,
            level: 1,
            disabled: disabledParent ? level > 2 : false,
            children:
              children &&
              level > 2 &&
              children.map(({ code, id, name }) => ({
                title: `${code}/${name}`,
                key: `${id}`,
                value: `${id}`,
                level: 2,
              })),
          })),
      };
    });
    this.setState({ treeData, treeKey: 'key' });
  };

  onChange = (value, node, extra) => {
    this.setState({ value });
    this.props.onChange(value, node, extra);
  };

  render() {
    console.log(this.props);
    const { treeData, value, treeKey } = this.state;
    return (
      <TreeSelect
        key={treeKey}
        treeData={treeData}
        onSearch={value => this.setTreeData(value)}
        style={{ width: 150 }}
        showSearch
        filterTreeNode={() => true}
        {...this.props}
        value={value}
        onChange={this.onChange}
      />
    );
  }
}

export default StorageTreeSelect;
