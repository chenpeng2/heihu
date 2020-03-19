import * as React from 'react';
import _ from 'lodash';
import { TreeSelect } from 'antd';
import { Tooltip } from 'components';
import { getFolderList } from 'services/knowledgeBase/file';
import { isFunction } from 'util';

const TreeNode = TreeSelect.TreeNode;

type propsType = {
  onChange: () => {},
  multiple: Boolean,
  treeCheckable: Boolean,
  onlyWorkstations: Boolean,
  style: {},
  value: [],
  formatNode: () => {},
  params: {},
  disableSearch: boolean,
  disabledNode: () => {},
};

class FolderSelect extends React.Component<propsType> {
  state = {
    treeData: [],
    treeDefaultExpandAll: false,
  };

  async componentWillMount() {
    await this.setTreeData();
    this.setState({ value: this.props.value });
  }

  componentDidMount() {
    this._ismounted = true;
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.value, this.props.value)) {
      this.setState({ value: nextProps.value });
    }
  }

  componentWillUnmount() {
    this._ismounted = false;
  }

  setTreeData = async params => {
    const { params: _params } = this.props;

    const {
      data: { data },
    } = await getFolderList({ status: 1, ...params, ..._params });
    const treeData = data.map(node => {
      return this.formatNode(node);
    });
    this.setState({ treeData, key: Math.random() });
  };

  formatNode = (node, parent, cb) => {
    const { disabledNode } = this.props;
    const res = {
      title: <Tooltip length={20} text={node.name} />,
      value: node.id,
      type: node.type,
      disabled: isFunction(disabledNode) && disabledNode(node),
      key: node.id,
      id: node.id,
    };
    res.children = node.childrenFolders && node.childrenFolders.map(ws => this.formatNode(ws, res, cb));
    if (cb) {
      cb(res);
    }
    return res;
  };

  onChange = value => {
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  };

  findNode = (treeData, value) => {
    let res;
    const [type, id] = value.split('-');
    if (treeData) {
      treeData.forEach(node => {
        if (res) {
          return;
        }
        if (Number(node.id) === Number(id) && type === node.type) {
          res = node;
        } else {
          res = this.findNode(node.children, value);
        }
      });
    }
    return res;
  };

  mapTreeNode = data => {
    return (
      data &&
      data.map(item => {
        if (item.children) {
          return <TreeNode {...item}>{this.mapTreeNode(item.children)}</TreeNode>;
        }
        return <TreeNode {...item} />;
      })
    );
  };

  render() {
    const { params, style, disableSearch, ...rest } = this.props;
    const { treeData, value, key } = this.state;
    const nodes = _.cloneDeep(treeData);

    return (
      <TreeSelect
        key={key}
        ref={e => (this.treeSelect = e)}
        style={style}
        treeNodeFilterProp="title"
        treeDefaultExpandAll
        // loadData={async node => {
        //   const {
        //     props: { type, id, isSearched },
        //   } = node;
        //   if (isSearched) {
        //     return;
        //   }
        //   const dfs = e => {
        //     let res;
        //     let find;
        //     e.forEach(e => {
        //       if (find) {
        //         return;
        //       }
        //       if (e.type === type && e.id === id) {
        //         res = e;
        //         find = true;
        //       } else if (e.children && e.children.length) {
        //         res = dfs(e.children);
        //         if (res) {
        //           find = true;
        //         }
        //       }
        //     });

        //     return res;
        //   };
        //   const { treeData } = this.state;
        //   const treeNode = dfs(treeData);
        //   const {
        //     data: { data },
        //   } = await getFolderList({ parentId: id, enabled: true, ...params });
        //   if (treeNode) {
        //     treeNode.children = data.map(node => {
        //       return this.formatNode(node, treeNode);
        //     });
        //   }
        //   this.setState({ treeData });
        //   return data;
        // }}
        allowClear
        {...rest}
        value={value}
        showCheckedStrategy={TreeSelect.SHOW_CHILDREN}
        onChange={this.onChange}
      >
        {this.mapTreeNode(nodes)}
      </TreeSelect>
    );
  }
}

export default FolderSelect;
