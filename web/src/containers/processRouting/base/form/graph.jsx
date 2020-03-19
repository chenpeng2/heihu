import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { ProcessRouteChart, Icon, Tooltip, FormattedMessage } from 'src/components';
import { black, grey, border, white, fontSub, primary } from 'src/styles/color';
import { nodeMinHeight } from 'src/components/routeChart/baseComponent/node';
import { ORGANIZATION_CONFIG, getOrganizationConfigFromLocalStorage } from 'src/utils/organizationConfig';
import { replaceSign } from 'constants';

const Plus = ProcessRouteChart.Plus;
const PLUS_SIZE = Plus.PLUS_SIZE;
const Reduce = ProcessRouteChart.Reduce;
const REDUCE_SIZE = Reduce.REDUCE_SIZE;
const reduceStyle = {
  position: 'absolute',
  right: `-${REDUCE_SIZE / 2}px`,
  top: `-${REDUCE_SIZE / 1.5}px`,
  zIndex: 100,
};

type Props = {
  ProcessListData: any,
  form: any,
  onNodeClick: () => {},
  editing: boolean,
  activeProcessUUID: string,
  activeProcessContainerUUID: string,
  draggable: boolean,
};

class ProcessRouteGraph extends Component {
  props: Props;
  state = {
    loading: false,
    editing: false,
    open: false,
    fullScreenState: false,
  };

  componentWillMount() {
    const { editing } = this.props;

    this.setState({
      editing,
    });
  }

  judgeActiveNode = (processUUID, processContainerUUID) => {
    const { activeProcessUUID, activeProcessContainerUUID } = this.props;
    if (activeProcessUUID === processUUID && activeProcessContainerUUID === processContainerUUID) {
      return true;
    }
    return false;
  };

  renderOpenButton() {
    const { open } = this.state;
    return (
      <div
        style={{ margin: 'auto', width: 87, cursor: 'pointer' }}
        onClick={() => {
          this.setState({ open: !open });
        }}
      >
        <div style={{ color: fontSub }}>
          <FormattedMessage defaultMessage={open ? '收起' : '展开'} />
        </div>
        <div style={{ fontSize: 10, marginLeft: 5, color: fontSub }}>
          {open ? <Icon type={'up'} /> : <Icon type={'down'} />}
        </div>
      </div>
    );
  }

  renderNode = (nodeData, nodeDataIndex, nodeContainerDataIndex, allData) => {
    const { onNodeClick } = this.props;
    const name = _.get(nodeData, 'process.name');
    return (
      <div
        onClick={() => {
          if (onNodeClick) {
            onNodeClick(nodeData, nodeDataIndex, nodeContainerDataIndex, allData);
          }
        }}
        style={{
          textAlign: 'center',
          height: nodeMinHeight,
          lineHeight: `${nodeMinHeight}px`,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        <Tooltip text={name || ''} length={13} />
      </div>
    );
  };

  renderEditNode = (nodeData, nodeDataIndex, nodeContainerDataIndex, allData) => {
    const { ProcessListData, form, onNodeClick } = this.props;

    const containerData = allData[nodeContainerDataIndex];
    const nodes = containerData.nodes;
    const isParallelProcess = !(nodes.length <= 1);

    const { processUUID } = nodeData || {};
    const { processContainerUUID } = containerData || {};

    const isActiveNode = this.judgeActiveNode(processUUID, processContainerUUID);

    const baseStyle = {
      textAlign: 'center',
      height: nodeMinHeight,
      cursor: 'pointer',
      color: isActiveNode ? primary : black,
      border: isActiveNode ? `1px solid ${primary}` : 'none', // 如果是被点击的node需要改变边框
      boxShadow: isActiveNode ? `0px 0px 6px ${primary}` : 'none',
      borderRadius: '2px',
      overflow: 'hidden',
    };

    const { process } = nodeData;
    const { name } = process || {};

    if (isParallelProcess) {
      return (
        <div onClick={() => onNodeClick(nodeData, nodeDataIndex, nodeContainerDataIndex, allData)} style={baseStyle}>
          <div
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              lineHeight: `${nodeMinHeight}px`,
            }}
          >
            <Tooltip text={name || ''} length={13} />
          </div>
          {/* 并行工序至少有两个子工序 */}
          {nodes && nodes.length > 2 ? (
            <Reduce
              style={reduceStyle}
              reduceClick={() => {
                ProcessListData.deleteProcess(processUUID, processContainerUUID);

                form.setFieldsValue({
                  processList: ProcessListData.getProcessListData(),
                });
              }}
            />
          ) : null}
        </div>
      );
    }
    return (
      <div>
        <div style={baseStyle} onClick={() => onNodeClick(nodeData, nodeDataIndex, nodeContainerDataIndex, allData)}>
          <div
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: `${nodeMinHeight}px`,
            }}
          >
            <Tooltip text={name || ''} length={20} />
          </div>
        </div>
        {/* 只有一个工序的时候不可以删除 */}

        {allData && allData.length > 1 ? (
          <Reduce
            style={reduceStyle}
            reduceClick={() => {
              ProcessListData.deleteProcessContainer(processContainerUUID);

              form.setFieldsValue({
                processList: ProcessListData.getProcessListData(),
              });
            }}
          />
        ) : null}
      </div>
    );
  };

  renderEditContainer = (containerData, nodeContainerDataIndex, allData) => {
    const { ProcessListData, form } = this.props;
    const nodes = containerData.nodes;

    const processContainerUUID = containerData ? containerData.processContainerUUID : null;
    const isParallelProcess = !(nodes.length <= 1);

    // 如果organization的配置是不允许并行工序，就不可以创建
    const config = getOrganizationConfigFromLocalStorage();
    const configParallelProcess = !(
      config &&
      config[ORGANIZATION_CONFIG.parallelProcess] &&
      config[ORGANIZATION_CONFIG.parallelProcess].configValue === 'false'
    );

    const plusStyle = {
      position: 'absolute',
      right: `-${PLUS_SIZE}px`,
      top: `calc(50% - ${PLUS_SIZE / 2}px)`,
      left: `calc(100% - ${PLUS_SIZE / 2}px)`,
    };

    return (
      <div>
        <Plus
          normalProcessClick={() => {
            ProcessListData.addNormalProcessContainer(nodeContainerDataIndex);
            form.setFieldsValue({ processList: ProcessListData.getProcessListData() });
          }}
          parallelProcessClick={() => {
            ProcessListData.addParallelProcessContainer(nodeContainerDataIndex);
            form.setFieldsValue({ processList: ProcessListData.getProcessListData() });
          }}
          hideParallelProcessButton={!configParallelProcess}
          style={plusStyle}
        />
        {/* 只有一个工序不可以删除 */}
        {isParallelProcess && Array.isArray(allData) && allData.length > 1 ? (
          <Reduce
            style={reduceStyle}
            reduceClick={() => {
              ProcessListData.deleteProcessContainer(processContainerUUID);
              form.setFieldsValue({
                processList: ProcessListData.getProcessListData(),
              });
            }}
          />
        ) : null}
        {/* 并行工序需要有添加子工序的按钮 */}
        {isParallelProcess ? (
          <div
            style={{
              margin: 'auto',
              width: 107,
              height: 47,
              lineHeight: '47px',
              borderRadius: 2,
              marginBottom: 15,
              textAlign: 'center',
              border: `1px dashed ${border}`,
              background: white,
              fontSize: 20,
              cursor: 'pointer',
            }}
            onClick={() => {
              ProcessListData.addParallelProcessChild(processContainerUUID);
              form.setFieldsValue({
                processList: ProcessListData.getProcessListData(),
              });
            }}
          >
            +
          </div>
        ) : null}
      </div>
    );
  };

  renderContainer = () => {
    return null;
  };

  render() {
    const { editing, open } = this.state;
    const { ProcessListData, form, draggable } = this.props;

    return (
      <div
        style={{
          width: '100%',
          background: grey,
          position: 'relative',
        }}
      >
        <div
          style={{
            height: open ? 690 : 320,
            overflow: 'scroll',
            border: `10px solid ${grey}`,
            padding: 10,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ProcessRouteChart
            draggable={draggable}
            data={ProcessListData && ProcessListData.getProcessListData ? ProcessListData.getProcessListData() : []}
            onDragEnd={(containerUUID, targetIndex) => {
              // 拖拽结束的时候调整data的顺序
              const res = ProcessListData.changeProcessContainerSequence(containerUUID, targetIndex);

              if (!res) return;

              // 获取新的data后需要重新设置值
              const newValue = ProcessListData.getProcessListData();
              form.setFieldsValue({
                processList: newValue,
              });
            }}
            style={{ marginTop: 'auto', marginBottom: 'auto' }}
            renderNode={editing ? this.renderEditNode : this.renderNode}
            renderContainer={editing ? this.renderEditContainer : this.renderContainer}
          />
        </div>
        {this.renderOpenButton()}
      </div>
    );
  }
}

ProcessRouteGraph.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default ProcessRouteGraph;
