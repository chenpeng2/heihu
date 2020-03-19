import React, { Component } from 'react';
import { diff } from 'utils/time';
import { genArr } from 'utils/array';

class ProgressChart extends Component {
  props: { data: {}, range: {}, viewer: {}, onNodeSelect: () => {}, Renderer: Component, disabled: boolean, fetchData: () => {} };
  state = {};

  renderNode = (node, range) => {
    const { Renderer, fetchData, onNodeSelect } = this.props;
    if (node.children) {
      return (
        <div key={node.id}>
          <Renderer
            fetchData={fetchData}
            viewer={this.props.viewer}
            style={{ padding: 10 }}
            onNodeSelect={onNodeSelect}
            node={node}
            range={range}
            disabled={this.props.disabled}
          />
          {node.open ? <div>{node.children.map(child => this.renderNode(child, range))}</div> : null}
        </div>
      );
    }
    return (
      <Renderer
        viewer={this.props.viewer}
        style={{ padding: 10 }}
        fetchData={fetchData}
        onNodeSelect={onNodeSelect}
        key={node.id}
        node={node}
        range={range}
        disabled={this.props.disabled}
      />
    );
  };

  render() {
    const { data, range } = this.props;
    const { timeItemWidth } = this.context;
    const { defaultEndTime, defaultStartTime, interval } = range;
    const length = Math.round(diff(defaultEndTime, defaultStartTime) / interval);
    if (!data) {
      return null;
    }
    return (
      <div style={{ position: 'relative' }}>
        {genArr(length).map(e => (
          <div
            key={e}
            style={{ position: 'absolute', width: 1, top: 0, bottom: 0, left: e * timeItemWidth - 1, zIndex: 1, backgroundColor: '#EAECF1' }}
          />
        ))}
        {data.map(node => this.renderNode(node, range))}
      </div>
    );
  }
}
ProgressChart.contextTypes = {
  timeItemWidth: Number,
  range: {
    defaultStartTime: Date,
    defaultEndTime: Date,
    interval: Number,
  },
};

export default ProgressChart;
