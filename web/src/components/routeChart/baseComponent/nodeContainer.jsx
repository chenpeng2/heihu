// @flow
import * as React from 'react';
import { border, fontSub } from 'src/styles/color';
import Node from './node';
import styles from './styles.scss';
import type { nodeDataType, allDataType, nodeContainerDataType, renderContainerType, renderNodeType } from '../type';

const containerStyle = {
  position: 'relative',
};

export const NODE_CONTAINER_WIDTH = 150;

export type Props = {
  style?: {},
  nodeContainerData: nodeContainerDataType,
  nodeContainerDataIndex: number,
  activeNodeContainerIndex: number,
  activeNodeIndex: number,
  allData: allDataType,
  renderNode: renderNodeType,
  renderContainer: renderContainerType,
  onContainerClick?: (nodeContainerData: nodeContainerDataType, nodeContainerDataIndex: number, allData: allDataType) => React.Node,
  activeNodeContainerStyle: {},
};

class NodesContainer extends React.Component<Props, {}> {
  state = {};

  isParallelProcess = (data: nodeContainerDataType): boolean => {
    const { nodes } = data;
    if (nodes && Array.isArray(nodes) && nodes.length <= 1) {
      return false;
    }
    return true;
  };

  renderParallelProcessContainer = (props: Props): React.Element<'div'> | null => {
    const {
      activeNodeContainerIndex,
      activeNodeIndex,
      nodeContainerData,
      nodeContainerDataIndex,
      allData,
      renderNode,
      renderContainer,
      onContainerClick,
      activeNodeContainerStyle,
    } = props;

    const { nodes, name } = nodeContainerData;
    let _containerStyle = { ...containerStyle };
    if (nodeContainerDataIndex === activeNodeContainerIndex && activeNodeIndex === 'nothing') {
      _containerStyle = { ..._containerStyle, ...activeNodeContainerStyle };
    }

    if (nodes && Array.isArray(nodes)) {
      return (
        <div
          style={{
            width: NODE_CONTAINER_WIDTH,
            border: `1px solid ${border}`,
            borderRadius: 2,
            ..._containerStyle,
          }}
          onClick={() => {
            if (onContainerClick) {
              onContainerClick(nodeContainerData, nodeContainerDataIndex, allData);
            }
          }}
          className={styles.nodeContainerStyle}
        >
          <div style={{ textAlign: 'center', color: fontSub }}>{name}</div>
          {nodes.map((d: nodeDataType, index: number): any => {
            return (
              <Node
                nodeData={d}
                nodeDataIndex={index}
                nodeContainerDataIndex={nodeContainerDataIndex}
                allData={allData}
                renderNode={renderNode}
                style={{ margin: 20 }}
              />
            );
          })}
          {renderContainer ? renderContainer(nodeContainerData, nodeContainerDataIndex, allData) : null}
        </div>
      );
    }

    return null;
  };

  renderNormalProcessContainer = (props: Props): React.Element<'div'> | null => {
    const { nodeContainerData, nodeContainerDataIndex, allData, renderNode, renderContainer } = props;

    const { nodes } = nodeContainerData || {};
    if (nodes && Array.isArray(nodes)) {
      return (
        <div style={containerStyle}>
          {nodes.map((d: nodeDataType, index: number): any => {
            return (
              <Node nodeData={d} nodeDataIndex={index} nodeContainerDataIndex={nodeContainerDataIndex} allData={allData} renderNode={renderNode} />
            );
          })}
          {renderContainer ? renderContainer(nodeContainerData, nodeContainerDataIndex, allData) : null}
        </div>
      );
    }

    return null;
  };

  render(): React.Element<'div'> | null {
    const { style, nodeContainerData } = this.props;

    return (
      <div style={style} className={styles.nodeContainer}>
        {this.isParallelProcess(nodeContainerData) ? this.renderParallelProcessContainer(this.props) : this.renderNormalProcessContainer(this.props)}
      </div>
    );
  }
}

export default NodesContainer;
