import React, { Component } from 'react';
import _ from 'lodash';

import { TreeSelect, Input } from 'src/components';
import { getStorageList } from 'src/services/knowledgeBase/storage';

import styles from './styles.scss';

const TreeNode = TreeSelect.AntTreeSelect.TreeNode;

type Props = {
  style: {},
  value: any,
  id: string,
};

const formatTreeData = tree => {
  const dfs = (data, level) => {
    if (!Array.isArray(data)) return null;

    return data.map(a => {
      const { id, name, children } = a || {};
      return { value: `${level}-${id}`, title: name, children: dfs(children, level + 1), disabled: level !== 3 };
    });
  };

  return dfs(tree, 1);
};

class StorageSelect extends Component {
  props: Props;
  state = {
    data: null,
  };

  componentDidMount() {
    this.getStorageData();
  }

  getStorageData = value => {
    getStorageList({ search: value, status: 1, size: 10 }).then(res => {
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
    const { style, id, ...rest } = this.props;
    const { data } = this.state;

    return (
      <div>
        {data ? (
          <TreeSelect
            {...rest}
            allowClear
            labelInValue
            placeholder={'请选择'}
            style={{ width: '100%', ...style }}
            filterTreeNode={() => true}
            onFocus={() => {
              setTimeout(() => {
                const ele = document.getElementById(id);
                const input = ele ? ele.getElementsByClassName('ant-input')[0] : null;
                if (input) {
                  input.focus();
                }
              }, 200);
            }}
            treeDefaultExpandAll
          >
            <TreeNode
              className={styles.treeNode}
              disabled
              title={
                <div className={styles.secondeStorageSelect} id={id}>
                  <Input placeholder={''} onChange={this.onSearch} />
                </div>
              }
              key={'search'}
              value={'search'}
            />
            {this.renderTreeNode(data)}
          </TreeSelect>
        ) : null}
      </div>
    );
  }
}

export default StorageSelect;
