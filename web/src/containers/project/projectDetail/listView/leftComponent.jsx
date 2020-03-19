import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { SortableTreeNodeHeight } from 'constants';
import { Search } from 'components';
import { myDfs } from 'utils/tree';
import { max } from 'utils/number';
import NodeTree from './nodeTree';

type Props = {
  relay: any,
  productOrder: any,
  nodeId: string,
  productOrderId: string,
  selectedProcessSeq: string,
  match: {},
  processList: [],
  onNodeClick: ?() => {},
  fetchData: () => {},
  disabled: boolean,
  projectStatus: {},
};

class LeftComponent extends Component {
  props: Props;
  state = {
    productOrderId: '',
    searchQuery: '',
    searchFoundCount: null,
  };

  render() {
    const { changeChineseToLocale } = this.context;
    const { processList, onNodeClick, fetchData, disabled, projectStatus } = this.props;
    const { searchQuery } = this.state;

    if (!processList) {
      return <div />;
    }
    // const nodeMap = _.keyBy(nodes, 'id');
    // const treeData = genTree(nodes, nodeMap, this.props.selectedNodeId);
    return (
      <div
        style={{
          // 减去 header tab 和搜索框的高度
          // height: max(processList.length * SortableTreeNodeHeight, window.innerHeight - 53),
          height: '100%',
        }}
      >
        <div
          style={{
            height: 110,
            position: 'sticky',
            top: 0,
            zIndex: 10,
            padding: 10,
            backgroundColor: 'rgb(250, 250, 250)',
          }}
        >
          <div style={{ fontSize: 14, padding: '6px 10px 26px' }}>{changeChineseToLocale('工序列表')}</div>
          <Search
            style={{ width: '100%' }}
            onSearchConfirm={search => {
              /*
                为了保证输入相同searchQuery时queryRender的isSearchFocus状态可以从true变成false
                从而保证scrollIntoView函数可以正常作用
              */

              myDfs(this.props.processList, node => {
                if (
                  search &&
                  ((node.title && node.title.toLowerCase().includes(search.toLowerCase())) ||
                    (node.name && node.name.toLowerCase().includes(search.toLowerCase())))
                ) {
                  node.searched = true;
                } else {
                  node.searched = false;
                }
              });
              this.setState({ search });
            }}
          />
        </div>
        <NodeTree
          data={processList}
          disabled={disabled}
          projectStatus={projectStatus}
          fetchData={fetchData}
          onNodeClick={node => {
            if (node.processSeq === this.props.selectedProcessSeq && node.parent) {
              return;
            }
            onNodeClick(node);
          }}
        />
      </div>
    );
  }
}

LeftComponent.contextTypes = {
  changeChineseToLocale: () => {},
};

export default withRouter(LeftComponent);
