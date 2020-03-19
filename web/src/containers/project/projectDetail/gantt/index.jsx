import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import { getPathname, getQuery, getLocation } from 'src/routes/getRouteParams';
import { Search, Gantt } from 'src/components';
import { myDfs } from 'utils/tree';
import { ganttBlacklakeGreen } from 'src/styles/color/index';
import moment, { diff, dayStart, formatToUnix, formatUnixMoment } from 'utils/time';
import { queryWorkingCalendar, getDowntimePlanByWorkstationIds } from 'src/services/schedule';
import { getProjectProcesses } from 'services/cooperate/project';
import NodeTree from './nodeTree';
import NodeChart from './nodeChart';
import styles from './styles.scss';

const headerHeight = 100;
const leftContainerWidth = 200;
const delta = 3;

const iconStyle = {
  width: 12,
  height: 8,
  borderRadius: 8,
  marginRight: 8,
};

class GanttPage extends Component {
  props: {
    viewer: {},
    productOrder: {},
    relay: {},
    disabled: boolean,
    outerHeight: Number,
    match: { params: { projectCode: string } },
  };
  state = {
    interval: 240,
    showOtherPlan: false,
    visible: false,
  };

  componentWillMount() {
    this.nodeMap = {};
    this.fetchData();
  }

  fetchData = async params => {
    const { match } = this.props;
    const { params: _params } = match || {};
    const { projectCode } = _params || {};
    getProjectProcesses({ ...params, projectCode: decodeURIComponent(projectCode) }).then(async res => {
      const { data } = res;
      const { data: processList } = data;
      const { nodeTree, startTime, endTime } = await this.getNodeTree(
        processList,
        processList.startTime,
        processList.endTime,
        processList,
        this.context,
      );

      this.setState({
        nodeTree,
        startTime,
        endTime,
      });
    });
  };

  ignoreScrollEvent = false;

  resolveOverlap = plans => {
    const result = [];
    plans
      .filter(e => e)
      .sort((a, b) => diff(a.endTimePlanned, b.startTimePlanned))
      .forEach(plan => {
        for (let i = 0; i < result.length; i += 1) {
          const currentPlans = result[i];
          const lastCurrentPlan = currentPlans[currentPlans.length - 1];
          if (!lastCurrentPlan || diff(plan.startTimePlanned, lastCurrentPlan.endTimePlanned) > 0) {
            currentPlans.push(plan);
            return;
          }
        }
        result.push([plan]);
      });
    return result;
  };

  getNodeTree = async (productOrderBomNodeList, startTime, endTime, productOrder) => {
    // _startTime 和 _endTime 用来存储最早的开始时间和最晚的结束时间
    let _startTime = dayStart(startTime);
    let _endTime = dayStart(endTime)
      .add(24, 'h')
      .subtract(1, 's');
    const _productOrderBomNodeList =
      Array.isArray(productOrderBomNodeList) && productOrderBomNodeList.length > 0
        ? productOrderBomNodeList.map(node => ({ ...node, processSeq: Number(node.processSeq) }))
        : [];
    const list = _.cloneDeep(_.sortBy(_productOrderBomNodeList, 'processSeq'));
    const workstationIds = _.flatten(list.map(e => e.taskWorkstations)).map(e => e.id);
    list.forEach(node => {
      node.taskWorkstations.forEach(workstation => {
        workstation.tasks
          .filter(e => e.projectCode === node.projectCode)
          .filter(e => e.statusDisplay !== '已取消')
          .forEach(task => {
            if (task.startTimePlanned && diff(_startTime, task.startTimePlanned || node.createdAt) > 0) {
              _startTime = dayStart(task.startTimePlanned);
            }
            if (task.endTimePlanned && diff(_endTime, task.endTimePlanned) < 0) {
              _endTime = dayStart(task.endTimePlanned)
                .add(24, 'h')
                .subtract(1, 's');
            }
          });
      });
    });
    let data;
    if (workstationIds) {
      const { data: _data } = await getDowntimePlanByWorkstationIds(workstationIds, {
        downtimeFrom: formatToUnix(_startTime),
        downtimeTill: formatToUnix(_endTime),
      });
      data = _data;
    }
    const { data: plans } = data || {};
    const downTimePlanMap = _.groupBy(
      plans &&
        plans.map(({ startTime, endTime, ...rest }) => ({
          ...rest,
          startTimePlanned: startTime && formatUnixMoment(startTime),
          endTimePlanned: endTime && formatUnixMoment(endTime),
          type: 'downtimePlan',
        })),
      plan => plan.workStationId,
    );
    const nodeList = list.map(node => {
      node.taskWorkstations.forEach(workstation => {
        workstation.tasks
          .filter(e => e.projectCode === node.projectCode)
          .filter(e => e.statusDisplay !== '已取消')
          .forEach(task => {
            if (task.startTimePlanned && diff(_startTime, task.startTimePlanned || node.createdAt) > 0) {
              _startTime = dayStart(task.startTimePlanned);
            }
            if (task.endTimePlanned && diff(_endTime, task.endTimePlanned) < 0) {
              _endTime = dayStart(task.endTimePlanned)
                .add(24, 'h')
                .subtract(1, 's');
            }
          });
      });
      node.workstations = node.taskWorkstations.map(workstation => {
        const { tasks } = workstation;
        workstation.tasks = this.resolveOverlap(
          tasks
            ? tasks
                .filter(e => e.projectCode === node.projectCode && _.isEqual(Number(e.processSeq), node.processSeq))
                .filter(e => e.statusDisplay !== '已取消')
                .map(({ startTimePlanned, endTimePlanned, startTimeReal, endTimeReal, ...rest }) => ({
                  ...rest,
                  availableWorkstations: node.workstations,
                  startTimePlanned: moment.unix(startTimePlanned / 1000),
                  endTimePlanned: moment.unix(endTimePlanned / 1000),
                  startTimeReal: startTimeReal && moment.unix(startTimeReal / 1000),
                  endTimeReal: startTimeReal && (endTimeReal ? moment.unix(endTimeReal / 1000) : moment()),
                }))
                .concat(downTimePlanMap[workstation.id])
            : [],
        );
        return workstation;
      });
      node.finished = productOrder && productOrder.status && productOrder.status.value === 'done';
      node.title = node.processName;
      // open字段代表树的展开收起
      node.open = true;

      return node;
    });
    const workstations = _.flatten(list.map(e => e.workstations));
    if (workstations && workstations.length) {
      const {
        data: { data: workingCalendar },
      } = await queryWorkingCalendar(workstations.map(e => e.id), {
        startTime: formatToUnix(_startTime),
        endTime: formatToUnix(_endTime),
      });
      if (workingCalendar) {
        workstations.forEach(e => (e.workingCalendar = []));
        workingCalendar.forEach(({ workstationId, startTime, endTime }) => {
          const workstation = workstations && workstations.find(e => e.id === workstationId);
          if (workstation) {
            workstation.workingCalendar.push({ startTime, endTime });
          }
        });
      }
    }
    const nodeTree = [];
    nodeList.forEach(node => {
      delete node.children;
      delete node.parent;
      if (!node.groupName) {
        nodeTree.push(node);
        return;
      }
      let parent = nodeTree.find(e => e.title === node.groupName);
      if (parent) {
        node.parent = parent;
        parent.children.push(node);
      } else {
        parent = {
          title: node.groupName,
          open: true,
          children: [node],
        };
        node.parent = parent;
        nodeTree.push(parent);
      }
    });

    // const nodeTree = Unflatten(_.cloneDeep(nodeList));
    // myDfs(nodeTree, node => {
    //   const { search } = this.state;
    //   node.level = node._parent ? node._parent.level + 1 : 0;
    //   if (search && (node.title.toLowerCase().includes(search.toLowerCase()) || node.name.toLowerCase().includes(search.toLowerCase()))) {
    //     node.searched = true;
    //   } else {
    //     node.searched = false;
    //   }
    // });
    return {
      nodeTree,
      startTime: moment(_startTime).subtract(1, 'days'),
      endTime: moment(_endTime).add(1, 'days'),
    };
  };

  renderLeft = () => {
    const { changeChineseToLocale } = this.context;
    return (
      <div
        className={styles.leftContainer}
        id="leftContainer"
        style={{ width: leftContainerWidth, overflowY: 'auto' }}
        onScroll={() => {
          const diff = this.rightContainer.scrollTop - this.leftContainer.scrollTop;
          if (this.ignoreScrollEvent) {
            this.ignoreScrollEvent = false;
            return;
          }
          if (Math.abs(diff) < delta) {
            return;
          }
          this.ignoreScrollEvent = true;
          this.rightContainer.scrollTop = this.leftContainer.scrollTop;
        }}
        ref={e => (this.leftContainer = e)}
      >
        <div
          className={styles.filterContainer}
          style={{ height: headerHeight, position: 'sticky', top: 0, zIndex: 10, padding: 10 }}
        >
          <div style={{ fontSize: 14, padding: '6px 10px 26px' }}>{changeChineseToLocale('工序列表')}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Search
              style={{ width: '100%' }}
              onSearchConfirm={search => {
                myDfs(this.state.nodeTree, node => {
                  if (
                    search &&
                    ((node.title && node.title.toLowerCase().includes(search.toLowerCase())) ||
                      (node.name && node.name.toLowerCase().includes(search.toLowerCase())))
                  ) {
                    node.searched = true;
                  } else {
                    node.searched = false;
                  }
                });
                this.setState({ search });
              }}
            />
          </div>
        </div>
        <div className={styles.tree} style={{ flexGrow: 1 }}>
          <NodeTree
            data={this.state.nodeTree}
            fetchData={this.fetchData}
            viewer={this.props.viewer}
            disabled={this.props.disabled}
            planFilter={this.state.planFilter}
            taskFilter={this.state.taskFilter}
            onNodeClick={node => {
              this.nodeMap[node.id] = node;
              this.setState({ data: this.state.data });
            }}
          />
        </div>
      </div>
    );
  };

  renderRight = () => {
    const { changeChineseToLocale } = this.context;
    const { viewer } = this.props;
    const { startTime, endTime } = this.state;

    const width = window.innerWidth - leftContainerWidth - 180;

    return (
      <Gantt
        getRef={e => {
          this.rightContainer = e;
        }}
        onScroll={() => {
          const diff = this.rightContainer.scrollTop - this.leftContainer.scrollTop;
          if (this.ignoreScrollEvent) {
            this.ignoreScrollEvent = false;
            return;
          }
          if (Math.abs(diff) < delta) {
            return;
          }
          this.ignoreScrollEvent = true;
          this.leftContainer.scrollTop = this.rightContainer.scrollTop;
        }}
        style={{
          backgroundColor: '#FFF',
        }}
        disabled={this.props.disabled}
        width={width}
        startTime={startTime}
        endTime={endTime}
        viewer={viewer}
        Renderer={NodeChart}
        fetchData={this.fetchData}
        data={this.state.nodeTree}
      >
        <div
          style={{
            display: 'flex',
            height: headerHeight / 3,
            lineHeight: `${headerHeight / 3}px`,
            position: 'sticky',
            backgroundColor: '#FFF',
            zIndex: 101,
            top: 0,
            left: 0,
            borderBottom: '1px solid #f3f3f3',
          }}
        >
          <span style={{ paddingLeft: 10 }}>{changeChineseToLocale('生产任务')}：</span>
          <div className={styles.legendContainer}>
            <div className={styles.title}>{changeChineseToLocale('计划')}</div>
            <div style={{ ...iconStyle, backgroundColor: '#C8EDE2', border: '1px dashed #02B980' }} />
          </div>
          <div className={styles.legendContainer}>
            <div className={styles.title}>{changeChineseToLocale('实际')}</div>
            <div style={{ ...iconStyle, backgroundColor: ganttBlacklakeGreen }} />
          </div>
          <div className={styles.legendContainer}>
            <div className={styles.title}>{changeChineseToLocale('停机')}</div>
            <div style={{ ...iconStyle, backgroundColor: 'rgba(255, 59, 48, 0.3)' }} />
          </div>
        </div>
      </Gantt>
    );
  };
  // TODO: 加上menu关闭时的宽度判断
  render() {
    return (
      <div
        id="productOrder_createPlan_gantt"
        className={styles.ganttContainer}
        style={{ height: window.innerHeight - 50 - (this.props.outerHeight || 0), overflowY: 'auto' }}
      >
        {this.renderLeft()}
        {this.renderRight()}
      </div>
    );
  }
}

GanttPage.contextTypes = {
  changeChineseToLocale: () => {},
};

export default GanttPage;
