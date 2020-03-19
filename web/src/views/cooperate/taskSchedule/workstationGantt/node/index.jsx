import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Menu, Dropdown, openModal, PlainText } from 'components';
import { getConfigCapacityConstraint } from 'utils/organizationConfig';
import { stringEllipsis } from 'utils/string';
import CapacityModal from './capacityModal';
import OptimizeModal from './optimizeModal';
import styles from './styles.scss';

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
    fetchTasks: () => {},
    fetchCapacityCoefficientsList: () => {},
    disabled: boolean,
  };
  state = { search: '' };

  render() {
    const { node, onClick, style, fetchTasks, fetchCapacityCoefficientsList } = this.props;
    let nodeContainerStyle = {};
    if (node.searched) {
      nodeContainerStyle = {
        backgroundColor: '#EFF0F4',
      };
    }

    const menu = (
      <Menu>
        <Menu.Item>
          <a
            onClick={() => {
              openModal({
                title: '修改产能',
                children: <CapacityModal workstation={node} onSuccess={fetchCapacityCoefficientsList} />,
                innerContainerStyle: { marginBottom: 90 },
                footer: null,
              });
            }}
          >
            <PlainText text="修改产能" />
          </a>
        </Menu.Item>
        <Menu.Item>
          <a
            onClick={() => {
              openModal({
                title: '优化排程',
                children: <OptimizeModal workstation={node} onSuccess={fetchTasks} />,
                innerContainerStyle: { marginBottom: 90 },
                footer: null,
              });
            }}
          >
            <PlainText text="优化排程" />
          </a>
        </Menu.Item>
      </Menu>
    );
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
          <div
            style={{
              width: '100%',
              paddingLeft: paddingLeftBase + paddingLeftLevel * node.level + 14,
            }}
          >
            <div
              style={{
                padding: '0 10px 0 20px',
                display: 'flex',
                height: 38 * (node.tasks && node.tasks.length) || 38,
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1 }}>{stringEllipsis(node.name, 19)}</div>
              {node.toManyTask === 1 && (
                <div
                  style={{
                    marginLeft: 5,
                    border: '1px solid #E8E8E8',
                    borderRadius: 10,
                    padding: '0 3px',
                    color: '#E8E8E8',
                  }}
                >
                  多
                </div>
              )}
              {getConfigCapacityConstraint() ? null : (
                <Dropdown overlay={menu} trigger={['click']}>
                  <span style={{ color: '#E8E8E8', cursor: 'pointer' }}>{'･･･'}</span>
                </Dropdown>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Node.contextTypes = {
  router: PropTypes.object,
};

export default withRouter(Node);
