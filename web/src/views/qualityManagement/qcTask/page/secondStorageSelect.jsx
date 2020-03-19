import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
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
    const { style, ...rest } = this.props;
    const { data } = this.state;
    if (!data) return null;
    const ele = document.getElementsByClassName(styles.secondeStorageSelect);
    const { changeChineseToLocale } = this.context;

    return (
      <div className={styles.secondeStorageSelect}>
        <TreeSelect
          {...rest}
          allowClear
          dropdownStyle={{ height: 175 }}
          labelInValue
          placeholder={changeChineseToLocale('请选择仓位')}
          style={style}
          getPopupContainer={() => ele[ele.length - 1]}
          onFocus={() => {
            setTimeout(() => {
              const input = ele[ele.length - 1].getElementsByClassName('ant-input')[0];
              if (input) {
                input.focus();
              }
            }, 200);
          }}
          filterTreeNode={() => true}
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

StorageSelect.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default StorageSelect;
