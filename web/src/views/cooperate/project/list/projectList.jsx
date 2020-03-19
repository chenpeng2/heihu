import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Modal } from 'antd';
import { Button, Link, openModal, Icon, message, haveAuthority } from 'src/components';
import auth from 'src/utils/auth';
import {
  getProjectList,
  bulkStartProject,
  bulkFinishProject,
  getInjectMoldProject,
  getInjectMoldProjectDetail,
} from 'src/services/cooperate/project';
import { border, middleGrey } from 'src/styles/color';
import { setLocation } from 'utils/url';
import { getQuery } from 'src/routes/getRouteParams';
import {
  getOrganizationConfigFromLocalStorage,
  ORGANIZATION_CONFIG,
  TASK_DISPATCH_TYPE,
} from 'src/utils/organizationConfig';
import { getTablePageSizeFromLocalStorage } from 'utils/localStorage';
import { getProjectListStatuses } from 'src/containers/project/utils';
import { queryProdTaskListByProjectCodes } from 'services/cooperate/prodTask';
import { getQcTasksByProjectCodes } from 'src/services/cooperate/qcTask';
import { getProjectFinishReasonList } from 'services/knowledgeBase/projectFinishReason';
import { PROJECT_CATEGORY_INJECTION_MOULDING } from 'constants';
import { TABLE_UNIQUE_KEY } from '../constants';
import ProjectTable from './projectTable';
import ProjectFilter, { formatValueForSearch, getInitialValue } from './projectFilter';
import ProjectImport from '../import/projectImport';
import BatchSelectPopConfirm from './batchSelectPopConfirm';
import FinishProjectModal from './finishProjectModal';

const confirm = Modal.confirm;

type Props = {
  style: {},
  match: {},
  form: any,
};

class ProjectList extends Component {
  props: Props;
  state = {
    data: [],
    pagination: {},
    visible: false,
    loading: false,
    actionName: null, // 区分批量操作种类
    showMaterialRequest: false, // 物料请求
    showBatchSelect: false, // 批量操作
    showBatchSelectPopConfirm: false, // popConfirm
    projectCodes: [], // 选择的项目code
    selected: [], // 已选项目record
  };

  componentDidMount() {
    // 本地保存的状态
    const statuses = getProjectListStatuses();
    const pageSize = getTablePageSizeFromLocalStorage(TABLE_UNIQUE_KEY);
    this.getAndSetData({ statuses, size: pageSize });
  }

  getAndSetData = async (params, clearSelectProjectCodes = true) => {
    const { match } = this.props;

    const initialValue = getInitialValue(match);

    this.setState({ loading: true });
    const query = getQuery(match);
    if (clearSelectProjectCodes) {
      this.tableRef.clearSelectProjectCodes(); // 非翻页的查询后清空已选项
      this.setState({ projectCodes: [], selected: [] });
    }
    const _params = { ...query, ...initialValue, ...params };
    setLocation(this.props, () => ({ ..._params }));
    let fetchProject = getProjectList;
    if (_params.category === 3) {
      fetchProject = getInjectMoldProject;
    }
    await fetchProject(formatValueForSearch(_params))
      .then(res => {
        const { data } = res || {};
        const { data: realData, total } = data || {};
        this.setState({
          data: realData.map(node => {
            if (_params.category === 3) {
              return { ...node, children: [] };
            }
            return node;
          }),
          pagination: {
            current: _params && _params.page,
            total,
            pageSize: (_params && _params.size) || 10,
          },
        });
      })
      .catch(err => console.log(err))
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  toggleVisible = visible => this.setState({ visible });

  toggleMaterialRequest = visible => this.setState({ showBatchSelect: visible });

  bulkFinishProject = async params => {
    const {
      data: {
        data: { amountTotal, amountSuccess },
      },
    } = await bulkFinishProject(params);
    message.success(`操作成功！${amountSuccess}条项目已结束！`);
    this.getAndSetData();
    this.setState({ showBatchSelect: false });
  };

  renderOperation = configValue => {
    const { showBatchSelect, projectCodes, actionName, selected } = this.state;
    const { router, changeChineseToLocale, changeChineseTemplateToLocale } = this.context;

    return (
      <div style={{ borderTop: `1px solid ${border}`, padding: '20px' }}>
        {showBatchSelect ? (
          <React.Fragment>
            {/* <BatchSelectPopConfirm
              cbForVisibleChange={v => {
                this.setState({ showBatchSelectPopConfirm: !!v });
              }}
              visible={this.state.showBatchSelectPopConfirm && actionName === 'materialRequest'}
            >
              <Button
                icon="plus-circle-o"
                style={{ marginRight: 20 }}
                onClick={() => {
                  if (!projectCodes.length) {
                    this.setState({ actionName: 'materialRequest', showBatchSelectPopConfirm: true });
                    return;
                  }
                  const { selected } = this.state;
                  const disabledData =
                    selected &&
                    selected.filter(record => {
                      return ['aborted', 'done'].indexOf(_.get(record, 'status.code')) >= 0;
                    });
                  if (_.get(disabledData, 'length') > 0) {
                    message.error('已结束或已取消的项目不能创建物料请求');
                    return;
                  }
                  this.setState({ showBatchSelectPopConfirm: false }, () => {
                    router.history.push({
                      pathname: '/cooperate/materialRequest/create',
                      state: {
                        projectCodes,
                      },
                    });
                  });
                }}
              >
                创建物料请求
              </Button>
            </BatchSelectPopConfirm> */}
            <BatchSelectPopConfirm
              cbForVisibleChange={v => {
                this.setState({ showBatchSelectPopConfirm: !!v });
              }}
              visible={this.state.showBatchSelectPopConfirm && actionName === 'weighingTask'}
            >
              <Button
                icon="plus-circle-o"
                disabled={!haveAuthority(auth.WEB_MANAGE_WEIGH_TASK)}
                style={{ marginRight: 20 }}
                onClick={() => {
                  const { projectCodes, selected } = this.state;
                  if (!projectCodes.length) {
                    this.setState({ actionName: 'weighingTask', showBatchSelectPopConfirm: true });
                    return;
                  }
                  // const selected = data && data.filter(x => projectCodes.indexOf(x && x.projectCode) >= 0);
                  const formated = selected && selected.map(x => ({ ...x, productCode: _.get(x, 'product.code') }));
                  const uniqByProductCode = _.uniqBy(formated, 'productCode');
                  if (uniqByProductCode && uniqByProductCode.length !== 1) {
                    message.error('所选项目的产出物料不同，无法合并称量！');
                    return null;
                  }
                  router.history.push(
                    `/weighingManagement/weighingTask/create?query=${JSON.stringify({ projectCodes })}`,
                  );
                }}
              >
                创建称量任务
              </Button>
            </BatchSelectPopConfirm>
            <BatchSelectPopConfirm
              cbForVisibleChange={v => {
                this.setState({ showBatchSelectPopConfirm: !!v });
              }}
              visible={this.state.showBatchSelectPopConfirm && actionName === 'startProject'}
            >
              <Button
                icon="plus-circle-o"
                style={{ marginRight: 20 }}
                onClick={async () => {
                  if (!projectCodes.length) {
                    this.setState({ actionName: 'startProject', showBatchSelectPopConfirm: true });
                    return;
                  }
                  // 过滤只剩下未开始的项目
                  const projectNeedStarted = selected.filter(e => e.status.status === 1);
                  if (!projectNeedStarted.length) {
                    message.error('当前选择的所有项目状态都是已开始');
                    return;
                  }

                  const {
                    data: {
                      data: { amountSuccess },
                    },
                  } = await bulkStartProject({ projectCodes });
                  message.success(`操作成功！${amountSuccess}条未开始项目已修改为执行中`);
                  this.getAndSetData();
                  this.setState({ showBatchSelect: false });
                }}
              >
                批量开始
              </Button>
            </BatchSelectPopConfirm>
            <BatchSelectPopConfirm
              cbForVisibleChange={v => {
                this.setState({ showBatchSelectPopConfirm: !!v });
              }}
              visible={this.state.showBatchSelectPopConfirm && actionName === 'finishProject'}
            >
              <Button
                iconType="gc"
                icon="jieshu"
                style={{ marginRight: 20, border: '1px solid #FF3B30', backgroundColor: '#FF3B30' }}
                onClick={async () => {
                  if (!projectCodes.length) {
                    this.setState({ actionName: 'finishProject', showBatchSelectPopConfirm: true });
                    return;
                  }
                  // 过滤未开始、已结束和已取消的项目
                  const projectNeedFinished = selected.filter(
                    e => e.status.status !== 5 && e.status.status !== 4 && e.status.status !== 1,
                  );
                  if (!projectNeedFinished.length) {
                    message.error('当前选择的所有项目状态都是未开始、已结束或已取消');
                    return;
                  }

                  const {
                    data: { data: prodTasks },
                  } = await queryProdTaskListByProjectCodes(
                    { projectCodes: projectNeedFinished.map(e => e.projectCode) },
                    { statuses: '1,2,3', needPage: true, size: 100 },
                  );
                  const {
                    data: { data: qcTasks },
                  } = await getQcTasksByProjectCodes(
                    { projectCodes: projectNeedFinished.map(e => e.projectCode), statuses: [1, 2] },
                    { size: 100 },
                  );
                  const {
                    data: { total: finishResultTotal },
                  } = await getProjectFinishReasonList({ size: 1, page: 1, status: 1 });
                  if (qcTasks.length > 0 || prodTasks.length > 0 || finishResultTotal > 0) {
                    openModal({
                      children: (
                        <FinishProjectModal
                          prodTasks={prodTasks}
                          ref={inst => (this.finishForm = inst)}
                          qcTasks={qcTasks}
                        />
                      ),
                      title: '批量结束',
                      footer: null,
                      onOk: async value => {
                        await this.bulkFinishProject({ projectCodes, ...value });
                      },
                    });
                  } else {
                    confirm({
                      title: '确定结束?',
                      content: `确定结束这${projectCodes.length}个项目吗？`,
                      onOk: () => this.bulkFinishProject({ projectCodes }),
                      iconType: 'exclamation-circle',
                      okText: '确定结束',
                      cancelText: '暂不结束',
                    });
                  }
                }}
              >
                批量结束
              </Button>
            </BatchSelectPopConfirm>
            <Button
              type={'default'}
              onClick={() => {
                this.toggleMaterialRequest(false);
                this.tableRef.clearSelectProjectCodes(); // 取消后需要清空已经选中的行
                this.setState({ projectCodes: [], selected: [] });
              }}
            >
              取消
            </Button>
            <span style={{ marginLeft: 10, color: middleGrey }}>
              {changeChineseTemplateToLocale('已选择{amount}个结果', {
                amount: Array.isArray(projectCodes) ? projectCodes.length : 0,
              })}
            </span>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {configValue === TASK_DISPATCH_TYPE.manager ? null : (
              <Button
                style={{ marginRight: 20, verticalAlign: 'middle' }}
                icon="plus-circle-o"
                onClick={() => {
                  router.history.push('/cooperate/projects/create');
                }}
              >
                创建项目
              </Button>
            )}
            {configValue === TASK_DISPATCH_TYPE.manager ? null : (
              <Button
                icon="download"
                onClick={() => this.toggleVisible(true)}
                type={'default'}
                style={{ marginRight: 20, verticalAlign: 'middle' }}
              >
                导入项目
              </Button>
            )}
            <Button
              icon="piliangcaozuo"
              iconType="gc"
              onClick={() => this.toggleMaterialRequest(true)}
              style={{ marginRight: 20, verticalAlign: 'middle' }}
              type={'default'}
            >
              {changeChineseToLocale('批量操作')}
            </Button>
            {configValue === TASK_DISPATCH_TYPE.manager ? null : (
              <Link onClick={() => (router ? router.history.push('/cooperate/projects/loglist') : null)}>
                查看导入日志
              </Link>
            )}
          </React.Fragment>
        )}
      </div>
    );
  };

  render() {
    const { data, pagination, loading, showBatchSelect } = this.state;
    const { match } = this.props;
    const config = getOrganizationConfigFromLocalStorage();
    const configValue =
      config &&
      config[ORGANIZATION_CONFIG.taskDispatchType] &&
      config[ORGANIZATION_CONFIG.taskDispatchType].configValue;

    return (
      <div>
        <ProjectFilter
          onFilter={(params, extra) => {
            this.getAndSetData({ ...params, page: 1 }, extra);
          }}
        />
        {this.renderOperation(configValue)}
        <ProjectTable
          ref={inst => (this.tableRef = inst)}
          showBatchSelect={showBatchSelect}
          cbForRowSelect={(rowKeys, rows) => {
            this.setState({ projectCodes: rowKeys, selected: rows });
          }}
          data={data || []}
          match={match}
          rowKey="projectCode"
          loading={loading}
          refreshData={params => this.getAndSetData(params, false)}
          pagination={pagination}
          onExpand={async (expanded, record) => {
            const { projectCode, category } = record;
            if (category === PROJECT_CATEGORY_INJECTION_MOULDING && expanded) {
              const {
                data: {
                  data: { projects },
                },
              } = await getInjectMoldProjectDetail({ projectCode });
              this.setState({
                data: data.map(node => {
                  if (node.projectCode === projectCode) {
                    return { ...node, children: projects.map(n => ({ ...n, isInjectChild: true })) };
                  }
                  return node;
                }),
              });
              // this.setState({ data });
            }
          }}
        />
        <ProjectImport visible={this.state.visible} toggleVisible={this.toggleVisible} />
      </div>
    );
  }
}

ProjectList.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: () => {},
  changeChineseTemplateToLocale: () => {},
};

export default withRouter(ProjectList);
