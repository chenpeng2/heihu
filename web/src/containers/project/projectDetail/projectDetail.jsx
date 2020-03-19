import React, { Component } from 'react';
import _ from 'lodash';
import { Radio } from 'antd';
import { ActionButton, Icon } from 'src/components';
import { primary, black, white, blacklakeGreen } from 'src/styles/color';
import { getProject, getProjectBatchRecordAuditStatus } from 'src/services/cooperate/project';
import {
  ORGANIZATION_CONFIG,
  TASK_DISPATCH_TYPE,
  getOrganizationConfigFromLocalStorage,
  configHasSOP,
} from 'src/utils/organizationConfig';
import { replaceSign } from 'constants';
import { isSubProject } from 'src/containers/project/utils';
import LinkToEditProject from 'src/containers/project/base/linkToEditProject';
import UpdateProjectStatus from 'src/containers/project/base/updateProjectStatus/updateProjectStatus';

import DetailCard from './detailCard';
import GanttPage from './gantt';
import ListView from './listView';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const actionButtonStyle = { background: white, color: blacklakeGreen, marginRight: 10 };

type Props = {
  match: {},
  history: any,
};

class ProjectDetail extends Component {
  props: Props;
  constructor(props) {
    super(props);
    this.state = {
      projectData: null,
    };
    this.childrenRef = React.createRef();
    this.listViewRef = React.createRef();
  }

  componentWillMount = async () => {
    const config = getOrganizationConfigFromLocalStorage();
    const route = localStorage.getItem('projectDetailRoute');
    this.setState({ config, route });
    await this.getProjectData();
  };

  getBatchRecordAuditStatus = async projectCode => {
    const res = await getProjectBatchRecordAuditStatus({ projectCode });
    const status = _.get(res, 'data.data');
    return status;
  };

  getProjectData = async () => {
    const { match } = this.props;
    const { params } = match || {};
    const { projectCode } = params || {};
    const _params = { code: decodeURIComponent(projectCode) };
    const batchRecordAuditStatus = await this.getBatchRecordAuditStatus(decodeURIComponent(projectCode));
    getProject(_params).then(res => {
      if (res) {
        const { data } = res;
        const { data: realData } = data || {};
        const { injectMoldProject, projects } = realData;
        if (injectMoldProject) {
          injectMoldProject.children = projects;
          this.setState({ projectData: { ...injectMoldProject, batchRecordAuditStatus } });
        } else {
          this.setState({
            projectData: { ...realData, batchRecordAuditStatus },
          });
        }
      }
    });
  };

  renderCreateSonProjectButton = () => {
    const projectCode = _.get(this.props, 'match.params.projectCode');

    const baseStyle = { color: primary, marginLeft: 10, cursor: 'pointer' };
    return (
      <React.Fragment>
        <ActionButton
          style={{ ...baseStyle, ...actionButtonStyle }}
          iconType={'chuangjian'}
          isGcIcon
          text={'创建子项目'}
          onClick={() => {
            this.props.history.push(`/cooperate/projects/${encodeURIComponent(projectCode)}/createSonProject`);
          }}
        />
      </React.Fragment>
    );
  };

  // 任务派遣方式是否为manager
  isTaskDispatchTypeEqualWorker = () => {
    const { config } = this.state;

    return _.get(config, 'config_task_dispatch_type.configValue') === 'worker';
  };

  // 判断是否有可编辑项目的工厂配置
  editProjectConfig = () => {
    const config = getOrganizationConfigFromLocalStorage();

    return _.get(config, 'config_project_edit.configValue');
  };

  renderOperations = (status, projectData, configValue, editProjectConfig) => {
    if (!status) {
      return replaceSign;
    }

    const { code: statusCode } = status;
    const { projectCode } = projectData;
    const _isSubProject = isSubProject(projectData);

    // 获取任务派遣方式
    const isTaskDispatchTypeEqualWorker = this.isTaskDispatchTypeEqualWorker();
    const renderBaseOperation = editable => {
      return (
        <div style={{ display: 'inline-block', marginLeft: 10 }}>
          {/* {(configValue === TASK_DISPATCH_TYPE.workerWeak && editable)} */}
          {(configValue !== TASK_DISPATCH_TYPE.manager && editable) || (editProjectConfig === 'true' && editable) ? (
            <LinkToEditProject
              projectCode={projectCode}
              isSubProject={_isSubProject}
              iconType={'bianji'}
              isGcIcon
              style={actionButtonStyle}
            />
          ) : null}
          <ActionButton
            style={actionButtonStyle}
            iconType={'chakanjilu'}
            isGcIcon
            text={'查看操作记录'}
            onClick={() => {
              this.props.history.push(`/cooperate/projects/${encodeURIComponent(projectCode)}/detail/operationHistory`);
            }}
          />
        </div>
      );
    };

    // 未开始状态, 开始, 暂停 可进行的操作是查看，操作，取消。
    if (statusCode === 'created' || statusCode === 'running' || statusCode === 'paused') {
      return (
        <div>
          {!isTaskDispatchTypeEqualWorker ? null : this.renderCreateSonProjectButton()}
          <UpdateProjectStatus
            useIcon
            projectData={projectData}
            freshData={async () => {
              await this.getProjectData();
              if (this.state.route === 'createPlan') {
                this.listViewRef.current.getWrappedInstance().fetchData();
              } else {
                this.childrenRef.current.fetchData();
              }
            }}
          />
          {renderBaseOperation(true)}
        </div>
      );
    }

    return renderBaseOperation(false);
  };

  changeView = () => {
    const { changeChineseToLocale } = this.context;
    const iconStyle = { marginRight: 5 };
    return (
      <RadioGroup defaultValue="1" size="small" value={this.state.route}>
        <RadioButton
          value="createPlan"
          onClick={() =>
            this.setState({ route: 'createPlan' }, () => {
              localStorage.setItem('projectDetailRoute', 'createPlan');
            })
          }
        >
          <Icon type="credit-card" style={iconStyle} />
          <span>{changeChineseToLocale('列表视图')}</span>
        </RadioButton>
        {!configHasSOP() && (
          <RadioButton
            value="progress"
            onClick={() =>
              this.setState({ route: 'progress' }, () => {
                localStorage.setItem('projectDetailRoute', 'progress');
              })
            }
          >
            <Icon type="bar-chart" style={iconStyle} />
            <span>{changeChineseToLocale('时间视图')}</span>
          </RadioButton>
        )}
      </RadioGroup>
    );
  };

  renderHeader = configValue => {
    const { changeChineseToLocale } = this.context;
    const { projectData } = this.state;
    const { status } = projectData || {};
    const editProjectConfig = this.editProjectConfig();

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: 20 }}>
        <div style={{ fontSize: 16, color: black }}>{changeChineseToLocale('项目详情')}</div>
        <div style={{ display: 'inline-block' }}>
          {this.renderOperations(status, projectData, configValue, editProjectConfig)}
        </div>
      </div>
    );
  };

  render() {
    const { projectData, config, showDetail } = this.state;
    const { status } = projectData || {};
    const configValue =
      config &&
      config[ORGANIZATION_CONFIG.taskDispatchType] &&
      config[ORGANIZATION_CONFIG.taskDispatchType].configValue;

    return (
      <div>
        {this.renderHeader(configValue)}
        <DetailCard
          projectData={projectData}
          onSwitchClick={showDetail => this.setState({ showDetail })}
          fetchProjectData={this.getProjectData}
        />
        <div style={{ padding: '10px 20px' }}>
          <div style={{ paddingBottom: 10 }}>{this.changeView()}</div>
          {this.state.route === 'createPlan' ? (
            <ListView
              ref={this.listViewRef}
              outerHeight={showDetail ? 398 : 231}
              disabled={
                configValue === TASK_DISPATCH_TYPE.worker ||
                configValue === TASK_DISPATCH_TYPE.workerWeak ||
                (projectData && projectData.status.code !== 'running')
              }
              {...this.props}
              projectStatus={status}
            />
          ) : (
            <div>
              <GanttPage
                ref={this.childrenRef}
                disabled={
                  configValue === TASK_DISPATCH_TYPE.worker ||
                  configValue === TASK_DISPATCH_TYPE.workerWeak ||
                  (projectData && projectData.status.code !== 'running')
                }
                outerHeight={showDetail ? 398 : 231}
                {...this.props}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

ProjectDetail.contextTypes = {
  changeChineseToLocale: () => {},
};

export default ProjectDetail;
