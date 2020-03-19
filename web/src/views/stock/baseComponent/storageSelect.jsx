import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Input, FilterSortSearchBar } from 'src/components';
import { TreeSelect } from 'antd';
import { setLocation } from 'utils/url';
import { getQuery } from 'src/routes/getRouteParams';
import { getStorageList } from 'src/services/knowledgeBase/storage';
import styles from './styles.scss';

type Props = {
  match: any,
  value: any,
  isReset: boolean,
  onChange: ?() => {},
};
const TreeNode = TreeSelect.TreeNode;

class DeliverStorageSelect extends Component {
  props: Props;
  state = {
    treeData: null,
    focus: false,
    inputValue: '',
  };

  componentDidMount() {
    const queryMatch = getQuery(this.props.match);
    this.setState({ inputValue: queryMatch.search || '' });
    this.getStorageList(queryMatch.search || '');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isReset) {
      this.getStorageList('', []);
    }
  }

  getStorageList = (value, initialStorage) => {
    getStorageList({ search: value })
      .then(res => {
        const data = res.data.data;
        const treeData = this.getTreeData(data.data, 1);
        this.setState({ treeData }, () => {
          const { match } = this.props;
          const queryMatch = getQuery(match);
          const { storage } = queryMatch;
          const _storage = initialStorage || storage;
          this.setState({ value: _storage });
          if (_storage && _storage.length) {
            if (_storage[0] && _storage[0].vlaue && _storage[0].value.split(',')[2] === '3') {
              this.getDisabledTreeDataByLv2storage(treeData, _storage[0].value, _storage);
            } else {
              this.getDisabledTreeData(treeData, _storage[0].value, true);
            }
          }
        });
      });
  }

  getTreeData = (data, level) => {
    data.forEach(n => {
      n.label = n.name;
      n.value = `${n.id},${n.code},${level}`;
      if (n.children && n.children.length) {
        this.getTreeData(n.children, level + 1);
      }
    });
    return data;
  }

  getDisabledTreeData = (treeData, triggerValue, checked) => {
    treeData.forEach(n => {
      if (n.value === triggerValue) {
        n.disabled = false;
      } else {
        n.disabled = checked;
      }
      if (n.children && n.children.length) {
        this.getDisabledTreeData(n.children, triggerValue, checked);
      }
    });
    this.setState({ treeData });
  }

  getDisabledTreeDataByLv2storage = (treeData, triggerValue, value) => {
    treeData.forEach(n => {
      n.disabled = !!value.length;
      if (n.children && n.children.length) {
        n.children.forEach(m => {
          m.disabled = !!value.length;
          if (m.children && m.children.map(n => n.value).includes(triggerValue)) {
            m.children.forEach(n => { n.disabled = false; });
          } else if (m.children && m.children.length) {
            m.children.forEach(n => { n.disabled = !!value.length; });
          }
        });
      }
    });
    this.setState({ treeData });
  }

  resetTreeData = treeData => {
    treeData.forEach(n => {
      n.disabled = false;
      if (n.children && n.children.length) {
        this.resetTreeData(n.children);
      }
    });
    return treeData;
  }

  onChange = (value, a, tree) => {
    const treeData = this.state.treeData;
    const { triggerValue, checked } = tree;
    const { onChange } = this.props;
    if (tree.triggerValue) {
      if (tree.triggerValue.split(',')[2] === '3') {
        this.getDisabledTreeDataByLv2storage(treeData, triggerValue, value);
      } else {
        this.getDisabledTreeData(treeData, triggerValue, checked);
      }
    }
    if (!value.length) {
      const _treeData = this.resetTreeData(treeData);
      this.setState({ treeData: _treeData });
    }
    this.setState({ value });
    if (onChange) {
      onChange(tree);
    }
  }

  renderTreeNode = treeData => (
    treeData.map(node => {
      const { value, label, children, disabled } = node;
      return (
        <TreeNode
          value={value}
          title={label}
          key={value}
          disabled={disabled}
        >
          {children ? this.renderTreeNode(children) : null}
        </TreeNode>
      );
    })
  )

  render() {
    const data = this.state.treeData || [];
    const ele = document.getElementsByClassName(styles.deliverStorageSelect);

    return (
      <div className={styles.deliverStorageSelect}>
        <TreeSelect
          style={{ width: '100%' }}
          treeCheckable
          allowClear
          treeDefaultExpandAll
          filterTreeNode
          value={this.state.value}
          treeCheckStrictly
          onChange={this.onChange}
          onSearch={() => { this.getStorageList(''); }}
          getPopupContainer={() => ele[ele.length - 1]}
          onFocus={() => {
            setTimeout(() => {
              const input = ele[ele.length - 1].getElementsByClassName('ant-input')[0];
              if (input) {
                input.focus();
              }
            }, 200);
          }}
          placeholder={'请输入仓位编号'}
        >
          <TreeNode
            disabled
            value={'inputSearch'}
            key={'inputSearch'}
            title={
              <Input
                placeholder={''}
                value={this.state.inputValue}
                onChange={value => {
                  this.setState({ inputValue: value });
                  setLocation(this.props, p => {
                    delete p.storage;
                    return ({ ...p, search: value });
                  });
                  this.getStorageList(value);
                }}
                onFocus={() => {}}
                onBlur={() => { this.setState({ inputValue: '' }); }}
              />
            }
          />
          {this.renderTreeNode(data)}
        </TreeSelect>
      </div>
    );
  }
}

export default withRouter(DeliverStorageSelect);
