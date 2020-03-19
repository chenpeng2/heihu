import React, { Component } from 'react';
import _ from 'lodash';

import { TreeSelect, Input } from 'src/components/index';
import { getStorageList } from 'src/services/knowledgeBase/storage';

import styles from '../inventory/list/styles.scss';

const TreeNode = TreeSelect.AntTreeSelect.TreeNode;

export const STORAGE_LEVEL = {
  storage: 0,
  firstStorage: 1,
  secondStorage: 2,
};

// 格式化后端拉回的storage数据
const formatStorageDataForSelect = (val, level, parentId) => {
  if (!Array.isArray(val)) return null;

  return val
    .map(item => {
      if (!item) return null;
      const { id, name, children } = item || {};

      const _children = Array.isArray(children)
        ? formatStorageDataForSelect(children, level + 1, `${level}-${id}`)
        : null;

      return {
        value: `${level}-${id}`,
        title: name,
        key: `${level}-${id}`,
        parentId: parentId || null,
        children: _children,
      };
    })
    .filter(a => a);
};

// 获取数据的层级
export const getValueLevel = value => {
  if (!value) throw new Error('参数错误');

  return value.split('-')[0];
};

// storage data的数据结构
class Tree {
  constructor(data) {
    this._value = formatStorageDataForSelect(data, Number(STORAGE_LEVEL.storage));
  }

  dfs = cb => {
    const dfsImpl = value => {
      if (!Array.isArray(value)) return;

      value.forEach(item => {
        const { children } = item || {};
        dfsImpl(children);

        if (typeof cb === 'function') cb(item);
      });
    };

    dfsImpl(this._value);
  };

  changeDisableForStorage = storageValue => {
    this.dfs(item => {
      if (item.value !== storageValue) {
        item.disabled = true;
      }
    });
  };

  changeDisableForFirstStorage = val => {
    this.dfs(item => {
      if (item.value !== val) {
        item.disabled = true;
      }
    });
  };

  changeDisableForSecondStorage = val => {
    let itemVal;
    this.dfs(item => {
      if (item.value === val) {
        itemVal = item;
      }
    });

    this.dfs(item => {
      if (item.parentId !== itemVal.parentId) {
        item.disabled = true;
      }
    });
  };

  clearDisable = () => {
    this.dfs(item => {
      item.disabled = false;
    });
  };

  getValue = () => {
    return this._value;
  };
}

type Props = {
  style: {},
  onChange: () => {},
  value: any,
  params: any,
};

class AreaSelect extends Component {
  props: Props;
  state = {
    treeData: new Tree(),
  };

  componentDidMount() {
    this.getStorageTreeData();
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.value, this.props.value)) {
      this.onClickForSelect(nextProps.value);
    }
    if (!_.isEqual(nextProps.params, this.props.params)) {
      this.getStorageTreeData(null, nextProps);
    }
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    if (_.isEqual(nextProps.value, this.props.value) && _.isEqual(nextState.treeData, this.state.treeData)) {
      return false;
    }

    return true;
  };

  getStorageTreeData = (searchValue, props) => {
    const { params } = props || this.props;
    return getStorageList({ search: searchValue, ...params }).then(res => {
      const data = _.get(res, 'data.data.data');

      this.setState({
        treeData: new Tree(data),
      });
    });
  };

  onClickForSelect = params => {
    const { onChange } = this.props;
    const { treeData } = this.state;

    // 如果清空输入框那么就重置disable
    if (!params || !params.length) {
      treeData.clearDisable();
    }

    if (Array.isArray(params)) {
      params.forEach(p => {
        const { value } = p;
        // 如果选中仓库节点，那么其他的仓库和仓库的子节点disable
        if (getValueLevel(value) === STORAGE_LEVEL.storage.toString()) {
          treeData.changeDisableForStorage(value);
        }

        // 如果选中一级仓库节点，那么其他的仓库disable，同一个仓库下的其他一级节点disable
        if (getValueLevel(value) === STORAGE_LEVEL.firstStorage.toString()) {
          treeData.changeDisableForFirstStorage(value);
        }

        // 如果选中二级仓库节点，要disable所有不是非父级的仓库节点
        if (getValueLevel(value) === STORAGE_LEVEL.secondStorage.toString()) {
          treeData.changeDisableForSecondStorage(value);
        }
      });
    }

    this.setState({ treeData }, () => {
      if (typeof onChange === 'function') onChange(params);
    });
  };

  onSearchForSelect = value => {
    this.getStorageTreeData(value).then(() => {
      this.onClickForSelect();
    });
  };

  renderTreeNode = val => {
    if (!Array.isArray(val)) return null;
    return val.map(item => {
      const { title, value, key, disabled, children } = item;

      const props = {
        value,
        title,
        key,
        disabled,
      };

      return <TreeNode {...props}>{this.renderTreeNode(children)}</TreeNode>;
    });
  };

  render() {
    const { style, ...rest } = this.props;
    const { treeData } = this.state;
    const ele = document.getElementsByClassName(styles.areaSelect);

    if (!treeData.getValue()) return null;

    return (
      <div className={styles.areaSelect}>
        <TreeSelect
          placeholder={'请输入仓位或仓位编号'}
          style={style}
          allowClear
          labelInValue
          treeCheckable
          treeCheckStrictly
          getPopupContainer={() => ele[ele.length - 1]}
          onFocus={() => {
            setTimeout(() => {
              const input = ele[ele.length - 1].getElementsByClassName('ant-input')[0];
              if (input) {
                input.focus();
              }
            }, 200);
          }}
          {...rest}
          onChange={this.onClickForSelect} // 需要放在rest后面，因为rest中有onChange
          filterTreeNode={() => true}
        >
          <TreeNode
            className={styles.treeNode}
            disabled
            title={<Input placeholder={''} onChange={this.onSearchForSelect} />}
            key={'search'}
            value={'search'}
          />
          {this.renderTreeNode(treeData.getValue())}
        </TreeSelect>
      </div>
    );
  }
}

// 获取仓位id，主要是将仓位id分类
export const getStorageIds = ids => {
  if (!Array.isArray(ids)) {
    return null;
  }

  let firstStorageId = null;
  const secondStorageId = [];
  let houseId = null;

  ids.forEach(id => {
    const level = getValueLevel(id);
    const value = id.split('-')[1];

    if (level === STORAGE_LEVEL.storage.toString()) {
      houseId = value;
    }

    // 如果选中一级仓库节点，那么其他的仓库disable，同一个仓库下的其他一级节点disable
    if (level === STORAGE_LEVEL.firstStorage.toString()) {
      firstStorageId = value;
    }

    // 如果选中二级仓库节点，不需要disable
    if (level === STORAGE_LEVEL.secondStorage.toString()) {
      secondStorageId.push(value);
    }
  });

  return {
    firstStorageId,
    secondStorageId: Array.isArray(secondStorageId) && secondStorageId.length ? secondStorageId.join(',') : null,
    houseId,
  };
};

export default AreaSelect;
