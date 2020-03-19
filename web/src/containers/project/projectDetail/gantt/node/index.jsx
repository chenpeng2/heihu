import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Icon, Tooltip } from 'components';
import { stringEllipsis } from 'utils/string';
import { blacklakeGreen } from 'src/styles/color/index';
import styles from './styles.scss';
import createProduceTask from '../../createTask';

const paddingLeftBase = 10;
const paddingLeftLevel = 12;

class Node extends Component {
  props: {
    node: {
      material: { id: string },
    },
    viewer: {},
    onClick: () => {},
    onMenuClick: () => {},
    style: {},
    relay: {},
    match: {
      params: {
        productOrderId: string,
      },
    },
    planFilter: [],
    disabled: boolean,
    fetchData: () => {},
  };
  state = { search: '' };

  render() {
    const { node, onClick, style, disabled, fetchData } = this.props;
    const { projectCode, processSeq } = node;
    const finished = node.finished;
    let nodeContainerStyle = {};
    if (node.searched) {
      nodeContainerStyle = {
        backgroundColor: '#EFF0F4',
      };
    }
    let finishedStyle = {};
    if (finished) {
      finishedStyle = {
        color: '#B8BFCF',
      };
    }
    return (
      <div
        style={{
          borderBottom: '1px solid #f3f3f3',
          borderRight: '1px solid #f3f3f3',
        }}
      >
        <div
          style={{
            ...style,
            paddingLeft: paddingLeftBase + paddingLeftLevel * node.level + 14,
            ...nodeContainerStyle,
          }}
          className={styles.treeNodeContainer}
          onClick={() => {
            if (onClick) {
              onClick(node);
            }
          }}
        >
          {node.children && node.children.length ? (
            node.open ? (
              <Icon type="minus-square-o" size={10} className="tree-icon" />
            ) : (
              <Icon type="plus-square-o" size={10} className="tree-icon" />
            )
          ) : !node.parent ? (
            <div style={{ width: 10, border: '1px solid #E8E8E8', borderRadius: 10, height: 10 }} />
          ) : (
            <div style={{ width: 10 }} />
          )}
          <div className={styles.content} style={{ flex: 1 }}>
            <div className={styles.title} style={node.searched ? { color: blacklakeGreen } : null} title={node.title}>
              {stringEllipsis(`${node.processSeq}/${node.title}`, 16)}
            </div>
            {/* <div className={styles.text} title={node.name}>
              {stringEllipsis(node.name, 16)}
            </div> */}
          </div>
        </div>
        <div
          style={{
            paddingLeft: paddingLeftBase + paddingLeftLevel * node.level + 14,
          }}
        >
          {!disabled && !node.children ? (
            <div style={{ padding: 10, paddingLeft: 60, color: blacklakeGreen }}>
              <span
                style={{ cursor: 'pointer', ...finishedStyle }}
                onClick={() => {
                  createProduceTask({ projectCode, processSeq }, { onSuccess: fetchData });
                }}
              >
                <Icon type="plus" />创建任务
              </span>
            </div>
          ) : null}
          <div>
            {node.workstations
              ? node.workstations.map(workstation => {
                  return workstation.tasks.map(
                    (planArr, index) =>
                      index ? (
                        <div style={{ height: 38 }} key={`${node.id}-${index}`} />
                      ) : (
                        <div style={{ padding: 10, paddingLeft: 60 }} key={`${node.id}-${index}`}>
                          · <Tooltip text={workstation.name} length={8} />
                        </div>
                      ),
                  );
                })
              : null}
          </div>
        </div>
      </div>
    );
  }
}

Node.contextTypes = {
  router: PropTypes.object,
  relayVariables: PropTypes.object,
};

export default withRouter(Node);
