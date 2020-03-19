import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Icon, Link } from 'components';
import { stringEllipsis } from 'utils/string';
import { configHasSOP } from 'utils/organizationConfig';
import { blacklakeGreen } from 'src/styles/color/index';
import createProduceTask from '../../createTask';
import styles from './styles.scss';

const paddingLeftBase = 10;
const paddingLeftLevel = 12;

class Node extends Component {
  props: {
    history: any,
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
    projectStatus: {},
  };
  state = { search: '', configHasSOP: configHasSOP() };

  render() {
    const { node, onClick, style, onMenuClick, disabled, projectStatus } = this.props;
    const { projectCode, processSeq, type } = node || {};
    const { configHasSOP } = this.state;
    const { status } = projectStatus || {};
    const showStockPlan = node.showStockPlan;
    const showProdPlan = node.showProdPlan;
    const showPurchasePlan = node.showPurchasePlan;
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

    let createLink =
      type === 'weighingTask' && [4, 5].indexOf(status) < 0 ? (
        <div style={{ padding: 5, paddingLeft: 60, color: blacklakeGreen }}>
          <Link
            icon="plus"
            style={{ cursor: 'pointer', ...finishedStyle }}
            onClick={() => {
              this.props.history.push(
                `/weighingManagement/weighingTask/create?query=${JSON.stringify({ projectCodes: [projectCode] })}`,
              );
            }}
          >
            创建任务
          </Link>
        </div>
      ) : !disabled && !node.children ? (
        <div style={{ padding: 5, paddingLeft: 60, color: blacklakeGreen }}>
          {/* <Hover
                hoverComponent={
                  <div style={{ position: 'absolute', top: 0, right: 5, cursor: 'pointer' }} onClick={() => onMenuClick(node)}>
                    {node.showPlan ? '收起' : '展开'}
                  </div>
                }
              > */}
          <span
            style={{ cursor: 'pointer', ...finishedStyle }}
            onClick={() => {
              createProduceTask({ projectCode, processSeq }, { onSuccess: this.props.fetchData });
            }}
          >
            <Icon type="plus" />
            创建任务
          </span>
          {/* </Hover> */}
        </div>
      ) : null;
    if (configHasSOP) {
      createLink = null;
    }
    return (
      <div
        style={{
          borderBottom: '1px solid #D3D8E3',
          backgroundColor: node.selected ? 'rgba(13, 199, 163, 0.1)' : 'transparent',
        }}
        onClick={() => {
          if (onClick) {
            onClick(node);
          }
        }}
      >
        <div
          style={{
            ...style,
            paddingLeft: paddingLeftBase + paddingLeftLevel * node.level + 14,
            ...nodeContainerStyle,
          }}
          className={styles.treeNodeContainer}
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
              {_.get(node, 'isConstant')
                ? _.get(node, 'title')
                : stringEllipsis(`${node.processSeq}/${node.title}`, 19)}
            </div>
            {/* <div className={styles.text} title={node.name}>
              {stringEllipsis(node.name, 19)}
            </div> */}
          </div>
        </div>
        <div
          style={{
            padding: 5,
            paddingLeft: paddingLeftBase + paddingLeftLevel * node.level + 14,
          }}
        >
          {createLink}
          {/* {showStockPlan && node.showPlan && !isConnectionEmpty(node.stockPlans) ? <div style={{ padding: 5 }}>· 库存</div> : null}
          {showPurchasePlan && node.showPlan && !isConnectionEmpty(node.purchasePlans) ? (
            <div>
              {node.groupedPurchasePlans.map(
                (purchasePlans, index) =>
                  index ? (
                    <div style={{ height: 28 }} key={`${node.id}-${index}`} />
                  ) : (
                    <div style={{ padding: 5 }} key={`${index}`}>
                      · 采购
                    </div>
                  ),
              )}
            </div>
          ) : null} */}
          {/* <div>
            {node.workstations.map(workstation => {
              return workstation.tasks.map(
                (planArr, index) =>
                  index ? (
                    <div style={{ height: 28 }} key={`${node.id}-${index}`} />
                  ) : (
                    <div style={{ padding: 5, paddingLeft: 60 }} key={`${node.id}-${index}`}>
                      · {workstation.name}
                    </div>
                  ),
              );
            })}
          </div> */}
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
