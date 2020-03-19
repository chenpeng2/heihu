import React, { Component } from 'react';
import Node from './node';

class NodeTree extends Component {
  props: { data: [], onNodeClick: () => {}, viewer: {}, relay: {}, disabled: boolean, projectStatus: {}, fetchData: () => {} };
  state = {};

  /* 一级工位被禁用二级工位也要禁用，后端没有支持，暂时用parent处理一下 */

  renderNode = node => {
    const { viewer, relay, disabled, onNodeClick, fetchData, projectStatus } = this.props;
    if (node.children) {
      return (
        <div>
          <Node
            style={{ padding: 10 }}
            // viewer={this.filterNotUsedStation(viewer)}
            node={node}
            disabled={disabled}
            relay={relay}
            fetchData={fetchData}
            onMenuClick={node => {
              node.showPlan = !node.showPlan;
              onNodeClick(node);
            }}
            onClick={node => {
              node.open = !node.open;
              onNodeClick(node);
            }}
          />
          {node.open ? <div>{node.children.map(child => this.renderNode(child))}</div> : null}
        </div>
      );
    }
    return (
      <Node
        viewer={viewer}
        relay={relay}
        fetchData={fetchData}
        projectStatus={projectStatus}
        style={{ padding: 10 }}
        node={node}
        disabled={disabled}
        onClick={node => {
          node.open = !node.open;
          onNodeClick(node);
        }}
      />
    );
  };

  render() {
    const { data } = this.props;
    if (!data) {
      return null;
    }

    return (<div>{data.map(node => this.renderNode(node))}</div>);
  }
}

export default NodeTree;
