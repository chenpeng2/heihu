import React, { Component } from 'react';
import SortableTree from 'react-sortable-tree';

export NodeRenderWithOnClick from './nodeContentRenderer';

/**
 * @api {SortableTree} SortableTree.
 * @APIGroup SortableTree.
 * @apiParam {Array} treeData 数据.
 * @apiExample {js} Example usage:
 * <SortableTree
    ref={e => (this.sortableTree = e)}
    treeData={treeData}
    canDrag={false}
    rowHeight={rowHeight}
    searchQuery={this.state.searchQuery}
    isVirtualized
    scaffoldBlockPxWidth={scaffoldBlockPxWidth}
    searchFocusOffset={0}
    nodeContentRenderer={NodeRenderWithOnClick(node => {
      this.setState({ selected: node.id, loading: true });
      const locationIds = _.flattenDeep(getLocationIds(node));
      setVariables(relay, { locationIds, first: 10, from: 0, lgUnitStatus: null }).then(() => {
        this.setState({ loading: false });
      });
    })}
   />
   其他详情见'react-sortable-tree'
 */

type Props = {
  treeData: any,
};

export default class Tree extends Component {
  props: Props;

  state = {
    treeData: [],
  };

  componentWillMount() {
    this.state.treeData = this.props.treeData;
  }

  componentWillReceiveProps(nextProps) {
    this.state.treeData = nextProps.treeData;
  }

  render() {
    return (
      <SortableTree
        {...this.props}
        treeData={this.state.treeData}
        onChange={treeData => this.setState({ treeData })}
      />
    );
  }
}
