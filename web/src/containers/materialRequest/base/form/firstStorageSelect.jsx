import React, { Component } from 'react';
import _ from 'lodash';

import { TreeSelect, Input } from 'src/components';
import { getStorageList } from 'src/services/knowledgeBase/storage';

import styles from './styles.scss';

const TreeNode = TreeSelect.AntTreeSelect.TreeNode;

type Props = {
  style: {},
  inputStyle: {},
};

const formatTreeData = tree => {
  const dfs = (data, level) => {
    if (!Array.isArray(data)) return null;
    if (level === 3) return null;

    return data.map(a => {
      const { id, name, children } = a || {};
      return { value: `${level}-${id}`, title: name, children: dfs(children, level + 1), disabled: level !== 2 };
    });
  };

  return dfs(tree, 1);
};

class StorageSelect extends Component {
  props: Props;
  state = {
    data: [],
  };

  componentDidMount() {
    this.getStorageData();
  }

  getStorageData = value => {
    getStorageList({ search: value, status: 1 }).then(res => {
      const data = _.get(res, 'data.data.data');
      this.setState({
        data: formatTreeData(data),
      });
    });
  };

  onSearch = value => {
    this.getStorageData(value);
  };

  renderTreeNode = val => {
    if (!Array.isArray(val)) return null;
    return val.map(item => {
      const { value, title, disabled, children } = item;

      const props = {
        value,
        title,
        disabled,
        name: title,
      };

      return (
        <TreeNode key={value} {...props}>
          {this.renderTreeNode(children)}
        </TreeNode>
      );
    });
  };

  render() {
    const { style, inputStyle, ...rest } = this.props;
    const { data } = this.state;
    const ele = document.getElementsByClassName(styles.firstStorageSelect);

    if (!data) return null;

    return (
      <div className={styles.firstStorageSelect} style={style}>
        <TreeSelect
          treeDefaultExpandAll
          {...rest}
          allowClear
          placeholder={'请选择'}
          style={{ width: '100%', ...inputStyle }}
          labelInValue
          filterTreeNode={() => true}
          getPopupContainer={() => ele[0]}
          onFocus={() => {
            setTimeout(() => {
              const input = ele[0].getElementsByClassName('ant-input')[0];
              if (input) {
                input.focus();
              }
            }, 200);
          }}
        >
          <TreeNode
            className={styles.treeNode}
            disabled
            title={<Input placeholder={''} onChange={this.onSearch} />}
            key={'search'}
            value={'search'}
          />
          {this.renderTreeNode(data)}
        </TreeSelect>
      </div>
    );
  }
}

export default StorageSelect;
