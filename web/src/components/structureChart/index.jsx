import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import 'orgchart';
import Spin from 'components/spin';
import 'orgchart/dist/css/jquery.orgchart.css';
import './styles.scss';

/**
 * @api {StructureChart} StructureChart.
 * @APIGroup StructureChart.
 * @apiParam {Obj} dataSource 要展示的数据.
 * @apiParam {String} className chart样式的className.
 * @apiParam {Array} nodes 要渲染的节点数组.
 * @apiParam {Function} onNodeClick 节点点击事件.
 * @apiParam {Boolean} loading 是否加载完成.
 * @apiParam {Obj} style -
 * @apiExample {js} Example usage:
 * <StructureChart
    style={{ width: '100%', height: document.body.clientHeight - 130 }}
    loading={this.state.loading}
    className="bomChart"
    dataSource={dataSource}
    nodes={[
      data => {
        const onClick = data => {
          const checked = (data.children || []).map(node => node);
          this.setState({ open: true, checked, selected: data });
        };
        if (!data.producible || !this.state.edit) {
          return null;
        }
        return (
          <Icon
            style={{ fontSize: 20, marginBottom: -5, color: '#0DC7A3' }}
            type="plus-square-o"
            onClick={() => onClick(data)}
          />
        );
      },
    ]}
   />
 */

type Props = {
  dataSource: any,
  className: string,
  onNodeClick: ?() => void,
  nodes: [ ?() => React.element | null ],
  loading: boolean,
  style: {},
};

class StructureChart extends Component {
  props: Props;

  state = {};

  componentDidMount() {
    this.drawChart();
  }

  componentDidUpdate() {
    $('#chart-container').empty();
    this.drawChart();
  }

  drawChart = () => {
    $('#chart-container').orgchart({
      data: this.props.dataSource,
      chartClass: this.props.className,
      draggable: false,
      nodeContent: 'title',
      createNode: ($node, data) => {
        if (this.props.onNodeClick) {
          $node.on('click', () => {
            this.props.onNodeClick(data);
          });
        }
        if (this.props.nodes) {
          this.props.nodes.forEach(renderNode => {
            const div = document.createElement('div');
            div.className = 'structureChartNodeContainer';
            const node = renderNode(data);
            $node.append(div);
            if (node) {
              ReactDOM.render(node, div);
            }
          });
        }
      },
    });
    $('.orgchart').addClass('noncollapsable');
  }

  ref = null;

  render() {
    return (
      <Spin spinning={this.props.loading || false}>
        <div
          id="chart-container"
          style={this.props.style}
        />
      </Spin>
    );
  }
}

export default StructureChart;
