import * as React from 'react';
import { TreeSelect } from 'antd';

/**
 * @api {TreeSelect} TreeSelect.
 * @APIGroup TreeSelect.
 * @apiExample {js} Example usage:
 * 详情见antd的TreeSelect
 */

type Props = {
  style: {},
};

class MyTreeSelect extends React.Component {
  props: Props;
  state = {};

  render() {
    const filterTreeNode = (inputValue, treeNode) => {
      const name = treeNode.props.name;

      return name && name.indexOf(inputValue) !== -1;
    };

    return <TreeSelect filterTreeNode={filterTreeNode} {...this.props} />;
  }
}

MyTreeSelect.AntTreeSelect = TreeSelect;

export default MyTreeSelect;
