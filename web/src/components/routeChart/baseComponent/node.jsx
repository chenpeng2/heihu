// @flow

import * as React from 'react';
import { border, white } from 'src/styles/color';
import styles from './styles.scss';
import type { nodeDataType, renderNodeType, allDataType } from '../type';

export const nodeMinHeight = 47;
export const NODE_WIDTH = 107;

const containerStyle = {
  border: `1px solid ${border}`,
  width: NODE_WIDTH,
  minHeight: nodeMinHeight,
  borderRadius: 2,
  background: white,
};

export type Props = {
  style?: {},
  nodeData: nodeDataType,
  nodeDataIndex: number,
  nodeContainerDataIndex: number,
  allData: allDataType,
  renderNode: renderNodeType,
};

class NodeContainer extends React.Component<Props, {}> {
  state = {};

  render(): React.Element<'div'> {
    const { nodeData, nodeDataIndex, nodeContainerDataIndex, allData, renderNode, style } = this.props;

    return (
      <div style={Object.assign({}, containerStyle, style || {}, { position: 'relative' })} className={styles.node}>
        {renderNode && nodeData ? renderNode(nodeData, nodeDataIndex, nodeContainerDataIndex, allData) : null}
      </div>
    );
  }
}

export default NodeContainer;
