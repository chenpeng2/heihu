import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import auth from 'src/utils/auth';
import { configHasSOP } from 'utils/organizationConfig';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { queryWeighingTaskByProject } from 'src/services/weighing/weighingTask';
import { getSOPProjectProcesses } from 'services/knowledgeBase/sop';
import { getProjectProcesses } from 'src/services/cooperate/project';
import { getQcTasks } from 'services/cooperate/qcTask';
import { setMenuState } from 'store/redux/actions/menu';
import { borderGrey } from 'src/styles/color';
import { Spin, haveAuthority } from 'components';
import LeftComponent from './leftComponent';
import MiddleComponent from './middleComponent';

const RIGHT_COMPONENT_WIDTH = window.innerWidth / 3 > 450 ? window.innerWidth / 3 : 450;

type Props = {
  relay: any,
  viewer: any,
  nodeId: string,
  productOrderId: string,
  location: {},
  match: {},
  setMenuState: () => {},
  dispatch: any,
  disabled: boolean,
  projectStatus: {},
};

class ListView extends Component {
  props: Props;
  state = {
    nodeId: '',
    route: 'progress',
    showRelevantPlan: false,
    loading: false,
    rightComponentWidth: RIGHT_COMPONENT_WIDTH,
    leftComponentWidth: 200,
    configHasSOP: configHasSOP(),
    projectStatus: {},
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!_.isEqual(nextProps.projectStatus, prevState.projectStatus)) {
      return {
        ...prevState,
        projectStatus: nextProps.projectStatus,
      };
    }
    return null;
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = params => {
    const { configHasSOP } = this.state;
    const { match } = this.props;
    const { params: _params } = match || {};
    const { projectCode } = _params || {};
    const constantNodes = !haveAuthority(auth.WEB_MANAGE_WEIGH_TASK)
      ? []
      : [
          {
            isConstant: true,
            title: '称量工序',
            selected: false,
          },
        ];

    const constantProcessList = constantNodes;
    if (constantNodes && constantNodes.length > 0) {
      constantNodes.forEach(({ title }, i) => {
        if (title === '称量工序') {
          queryWeighingTaskByProject({
            projectCode: decodeURIComponent(projectCode),
          })
            .then(res => {
              const data = _.get(res, 'data.data');
              const filterData = data && data.filter(o => o.status !== 6);
              constantProcessList[i] = {
                projectCode,
                ...constantProcessList[i],
                tasks:
                  filterData &&
                  filterData.map(x => ({
                    projectCode,
                    ...x,
                  })),
                type: 'weighingTask',
              };
            })
            .catch(err => console.log(err));
        }
      });
    }
    const fetchApi = configHasSOP ? getSOPProjectProcesses : getProjectProcesses;

    fetchApi({
      ...params,
      projectCode: decodeURIComponent(projectCode),
    }).then(res => {
      const { data } = res;
      const { data: processList } = data;
      const tasks = _.flattenDeep(
        processList
          .map(node => {
            return node.produceTasks;
          })
          .filter(e => e),
      ).filter(e => e.statusDisplay !== '已取消');
      const taskMap = _.keyBy(tasks, 'id');

      getQcTasks({
        projectCode: decodeURIComponent(projectCode),
        page: 1,
        size: 200,
      }).then(res => {
        const qcTasks = res.data.data;
        const groupedQcTasks = _.groupBy(qcTasks, e => e.taskId);
        _.map(groupedQcTasks, (qcTasks, taskId) => {
          if (taskMap[taskId]) {
            taskMap[taskId].qcTasks = qcTasks;
          }
        });
        const _processList = processList.map(node => ({
          ...node,
          title: node.processName,
          // produceTasks 是列表试图显示的任务
          produceTasks: node.produceTasks.filter(e => e.statusDisplay !== '已取消'),
          tasks: _.flattenDeep(
            node.taskWorkstations &&
              node.taskWorkstations.map(workstation => workstation.tasks.filter(e => e.statusDisplay !== '已取消')),
          ),
          processSeq: Number(node.processSeq),
        }));
        let selectedProcess = _processList.find(
          node => node.processSeq === (this.state.selectedProcess && this.state.selectedProcess.processSeq),
        );
        if (_processList && _processList.length) {
          if (!selectedProcess) {
            _processList[0].selected = true;
            selectedProcess = _processList && _processList.length && _processList[0];
          } else {
            selectedProcess.selected = true;
          }
        }
        const nodeTree = [];
        _.sortBy(_processList, 'processSeq').forEach(node => {
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

        this.setState({
          nodeTree: nodeTree.concat(constantNodes),
          processList: _processList.concat(constantProcessList),
          selectedProcess,
        });
      });
    });
  };

  render() {
    const { disabled } = this.props;

    const {
      projectStatus,
      showRelevantPlan,
      nodeTree,
      leftComponentWidth,
      rightComponentWidth,
      processList,
    } = this.state;

    if (!processList) {
      return <Spin />;
    }
    return (
      <div
        ref={e => (this.container = e)}
        style={{
          whiteSpace: 'nowrap',
          height: window.innerHeight - 50 - (this.props.outerHeight || 0),
          display: 'flex',
        }}
      >
        <div
          style={{
            width: leftComponentWidth,
            backgroundColor: '#FAFAFA',
            height: '100%',
            overflowY: 'auto',
            border: `1px solid ${borderGrey}`,
          }}
        >
          <LeftComponent
            processList={nodeTree}
            disabled={disabled}
            projectStatus={projectStatus}
            fetchData={this.fetchData}
            onNodeClick={n => {
              if (!n.children) {
                // const selectedProcess = processList.find(node => node.processSeq === n.processSeq);
                const selectedProcess = processList.find(node =>
                  _.get(n, 'isConstant') ? node.title === n.title : node.processSeq === n.processSeq,
                );

                if (_.get(n, 'isConstant')) {
                  processList.forEach(node => {
                    if (node.title === n.title) {
                      node.selected = true;
                    } else {
                      node.selected = false;
                    }
                  });

                  this.setState(
                    {
                      processSeq: 'weighingProcess',
                      selectedProcess,
                      route: 'weighingProcess',
                    },
                    () => {
                      ReactDom.findDOMNode(this.container).scrollIntoView();
                    },
                  );
                } else {
                  processList.forEach(node => {
                    if (node.processSeq === n.processSeq) {
                      node.selected = true;
                    } else {
                      node.selected = false;
                    }
                  });

                  this.setState(
                    {
                      processSeq: n.processSeq,
                      selectedProcess,
                      route: 'createPlan',
                    },
                    () => {
                      ReactDom.findDOMNode(this.container).scrollIntoView();
                    },
                  );
                }
              } else {
                this.setState({
                  selectedProcess: this.state.selectedProcess,
                });
              }
            }}
          />{' '}
        </div>{' '}
        <div
          style={{
            width: `calc(100% - ${leftComponentWidth}px)`,
            height: '100%',
            overflowY: 'auto',
            marginLeft: 10,
          }}
        >
          <MiddleComponent
            fetchData={this.fetchData}
            selectedProcess={this.state.selectedProcess}
            showRelevantPlan={() => {
              this.setState({
                showRelevantPlan: !showRelevantPlan,
                leftComponentWidth: !showRelevantPlan ? rightComponentWidth : leftComponentWidth,
              });
              this.props.setMenuState({
                visible: showRelevantPlan,
              });
              ReactDom.findDOMNode(this.container).scrollLeft = leftComponentWidth;
            }}
          />{' '}
        </div>{' '}
      </div>
    );
  }
}

const ListViewContainer = connect(
  () => {},
  {
    setMenuState,
  },
  null,
  {
    withRef: true,
  },
)(ListView);

export default ListViewContainer;
