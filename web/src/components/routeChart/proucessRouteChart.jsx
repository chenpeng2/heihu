// @flow
import * as React from 'react';
import Dragable from 'react-draggable';
import _ from 'lodash';

import { primary, white } from 'src/styles/color';

import Icon from '../icon';
import NodeContainer from './baseComponent/nodeContainer';
import type { Props as NodeContainerPropsType } from './baseComponent/nodeContainer';
import Line, { LINE_WIDTH } from './baseComponent/line';
import type { Props as LinePropsType } from './baseComponent/line';
import Node, { NODE_WIDTH, nodeMinHeight } from './baseComponent/node';
import type { Props as NodePropsType } from './baseComponent/node';
import Plus from './baseComponent/plus';
import type { Props as PlusPropsType } from './baseComponent/plus';
import Reduce from './baseComponent/reduce';
import type { Props as ReducePropsType } from './baseComponent/reduce';
import type { nodeContainerDataType, allDataType, renderNodeType, renderContainerType } from './type';

const containerStyle = {
  whiteSpace: 'nowrap',
};

type Props = {
  style?: {},
  data: allDataType,
  renderNode: renderNodeType,
  renderContainer: renderContainerType,
  activeNodeContainerStyle: {},
  activeNodeContainerIndex: number,
  activeNodeIndex: number,
  onContainerClick?: () => null,
  onDragEnd: () => {},
  draggable: boolean,
  draggableOptions: {},
};

class ProcessRouteChart extends React.Component<Props, {}> {
  state = {
    dragging: {},
  };

  static Arrow: React.ComponentType<LinePropsType> = Line;
  static Node: React.ComponentType<NodePropsType> = Node;
  static NodeContainer: React.ComponentType<NodeContainerPropsType> = NodeContainer;
  static Plus: React.ComponentType<PlusPropsType> = Plus;
  static Reduce: React.ComponentType<ReducePropsType> = Reduce;

  renderProcess = (
    processData: nodeContainerDataType,
    props: Props,
    dataIndex: number,
    allData: allDataType,
  ): React.Node => {
    const {
      renderNode,
      renderContainer,
      onContainerClick,
      activeNodeContainerIndex,
      activeNodeIndex,
      activeNodeContainerStyle,
    } = props;
    return (
      <NodeContainer
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          cursor: 'pointer',
        }}
        activeNodeContainerIndex={activeNodeContainerIndex}
        activeNodeIndex={activeNodeIndex}
        activeNodeContainerStyle={activeNodeContainerStyle}
        nodeContainerData={processData}
        allData={allData}
        nodeContainerDataIndex={dataIndex}
        renderNode={renderNode}
        renderContainer={renderContainer}
        onContainerClick={onContainerClick}
      />
    );
  };

  render(): React.Element<'div'> | null {
    const { style, data, onDragEnd, draggableOptions, draggable } = this.props;

    if (!data) {
      return null;
    }

    return (
      <div style={{ ...style, ...containerStyle }}>
        {data.map(
          (d: nodeContainerDataType, index: number): React.Node | null => {
            return (
              <div style={{ display: 'inline-block' }}>
                <div style={{ display: 'inline-block' }}>
                  {draggable ? (
                    <React.Fragment>
                      <Dragable
                        onStart={() => {
                          this.setState({ dragging: { [index]: true } });
                        }}
                        onStop={(__, b) => {
                          const { node, x } = b || {};
                          const { processContainerUUID } = d || {};
                          // 元素当前位置对应父级的左边的位置
                          const offsetLeft = _.get(node, 'offsetLeft', 0) + x + _.get(node, 'clientWidth', 0);
                          // 目标的index。
                          const targetIndex = Math.floor(offsetLeft / (NODE_WIDTH + LINE_WIDTH));
                          if (typeof onDragEnd === 'function') {
                            onDragEnd(processContainerUUID, targetIndex);
                          }
                          this.setState({ dragging: { [index]: false } });
                        }}
                        axis="x"
                        position={{ x: 0, y: 0 }} // 相对自己本身的位置
                        {...draggableOptions} // 可以利用这个属性复写上面的默认值
                      >
                        {_.get(this.state, 'dragging', {})[index] ? (
                          <div
                            style={{
                              borderRadius: 2,
                              width: NODE_WIDTH,
                              height: nodeMinHeight,
                              border: `1px dashed ${primary}`,
                              position: 'relative',
                              top: nodeMinHeight,
                              zIndex: 200,
                            }}
                          >
                            <div>
                              <Icon
                                iconType={'gc'}
                                style={{
                                  fontSize: 14,
                                  color: primary,
                                  background: white,
                                  paddingRight: 0,
                                  borderRadius: '50%',
                                  position: 'absolute',
                                  left: -7,
                                  top: -7,
                                }}
                                type={'gongxutuodong'}
                              />
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{ position: 'relative', top: 20, right: 6, zIndex: 200, display: 'inline-block' }}
                          >
                            <span style={{ fontSize: 20, cursor: 'move' }}>
                              <Icon
                                iconType={'gc'}
                                style={{
                                  fontSize: 14,
                                  color: primary,
                                  background: white,
                                  paddingRight: 0,
                                  borderRadius: '50%',
                                }}
                                type={'gongxutuodong'}
                              />
                            </span>
                          </div>
                        )}
                      </Dragable>
                      <div>{this.renderProcess(d, this.props, index, data)}</div>
                    </React.Fragment>
                  ) : (
                    <div>{this.renderProcess(d, this.props, index, data)}</div>
                  )}
                </div>
                {index === data.length - 1 ? null : <Line />}
              </div>
            );
          },
        )}
      </div>
    );
  }
}

export default ProcessRouteChart;
