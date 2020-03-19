/**
 * todo: 质检列表抽成单个组件，可供复用
 */
import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  DatePicker,
  FilterSortSearchBar,
  Input,
  Select,
  Button,
  withForm,
  Link,
  RestPagingTable,
  Badge,
  message,
  Spin,
  Text,
  FormattedMessage,
} from 'components';
import WorkstationAndAreaSelect from 'components/select/workstationAndAreaSelect';
import { queryQcTaskList, updateQcTaskStatus } from 'services/qualityManagement/qcTask';
import authorityWrapper from 'components/authorityWrapper';
import SearchSelect from 'components/select/searchSelect';
import { getQuery } from 'routes/getRouteParams';
import { getOrganizationConfigFromLocalStorage, ORGANIZATION_CONFIG } from 'utils/organizationConfig';
import moment, { formatDateTime } from 'utils/time';
import auth from 'utils/auth';
import { replaceSign } from 'constants';
import { CHECK_TYPE } from 'src/views/qualityManagement/constants';
import { white } from 'styles/color';
import { setLocation } from 'utils/url';
import { thousandBitSeparator } from 'utils/number';

import { qcTaskStatusMap, QCTASK_STATUS_AUDITING, qcTaskStatusColorMap } from '../../constants';
import { QcTaskOperationLogLink, PassQcReportAuditLink, RejectQcReportAuditLink } from '../../qcTask/base';
import { getDefect, getCheckTypeDisplay, formatQcTaskListFilterData } from '../../qcTask/utils';
import { fetchCustomRuleData } from '../../utils';
import { toQcConfigDetail } from '../../navigation';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;
const MyBadge = Badge.MyBadge;

const ButtonWithAuth = authorityWrapper(Button);
const LinkWithAuth = authorityWrapper(Link);
const LINK_STYLE = { marginRight: 10 };

type Props = {
  form: {
    getFieldDecorator: () => {},
    resetFields: () => {},
    getFieldValue: () => {},
    setFieldsValue: () => {},
  },
  match: {},
  onSuccess: () => {},
  data: {},
};

type State = {};

export const getQrCodeOrganizationConfig = () => {
  const config = getOrganizationConfigFromLocalStorage();

  return _.get(config, `[${ORGANIZATION_CONFIG.useQrcode}].configValue`);
};

/** 「质检报告审核」任务列表 */
class QcTaskList extends Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      dataSource: [],
      total: 0,
      exportData: [],
    };
  }

  componentDidMount() {
    this.setInitialData();
    fetchCustomRuleData();
    this.onSearch();
  }

  setInitialData = () => {
    const query = getQuery(this.props.match);
    const { taskEndTime, taskStartTime } = query;
    if (taskEndTime && !_.isEmpty(taskEndTime)) {
      taskEndTime[0] = moment(taskEndTime[0]);
      taskEndTime[1] = moment(taskEndTime[1]);
      this.props.form.setFieldsValue({
        taskEndTime,
      });
    }

    if (taskStartTime && !_.isEmpty(taskStartTime)) {
      taskStartTime[0] = moment(taskStartTime[0]);
      taskStartTime[1] = moment(taskStartTime[1]);
      this.props.form.setFieldsValue({
        taskStartTime,
      });
    }

    this.props.form.setFieldsValue({ ...query });
  };

  cancelQcTask = async code => {
    await updateQcTaskStatus(code, 3)
      .then(({ data }) => {
        if (data.message === '成功') {
          message.success('取消成功');
          const { form, match } = this.props;
          const queryMatch = getQuery(match);
          this.fetchData(queryMatch);
        }
      })
      .catch(e => console.log(e));
  };

  getColumns = () => {
    const { changeChineseToLocale } = this.context;
    return [
      {
        title: changeChineseToLocale('质检计划编号'),
        dataIndex: 'qcPlanCode',
        key: 'qcPlanCode',
        width: 100,
        render: qcPlanCode => qcPlanCode || replaceSign,
      },
      {
        title: changeChineseToLocale('任务编号'),
        dataIndex: 'code',
        key: 'code',
        width: 100,
        render: code => (code ? <span>{code}</span> : replaceSign),
      },
      {
        title: changeChineseToLocale('质检物料'),
        dataIndex: 'material',
        key: 'material',
        width: 185,
        render: material => {
          if (!material) return replaceSign;
          const display = `${material.code}/${material.name}`;
          if (material && material.type) return display;
          return (
            <Link onClick={() => window.open(`/bom/materials/${encodeURIComponent(material.code)}/detail`, '_blank')}>
              {display}
            </Link>
          );
        },
      },
      {
        title: changeChineseToLocale('质检方案'),
        dataIndex: 'qcConfig',
        key: 'qcConfig',
        width: 100,
        render: qcConfig => {
          if (!qcConfig) return replaceSign;
          const { name, id } = qcConfig;
          return name ? <Link.NewTagLink href={toQcConfigDetail(id)}>{name}</Link.NewTagLink> : replaceSign;
        },
      },
      {
        title: changeChineseToLocale('状态'),
        dataIndex: 'status',
        key: 'status',
        width: 80,
        render: status =>
          typeof status === 'number' ? (
            <MyBadge text={qcTaskStatusMap[status]} color={qcTaskStatusColorMap[status]} />
          ) : (
            replaceSign
          ),
      },
      {
        title: changeChineseToLocale('类型'),
        dataIndex: 'checkType',
        key: 'checkType',
        width: 70,
        render: (checkType, record) => {
          const { qcTaskClassification } = record;
          return <FormattedMessage defaultMessage={getCheckTypeDisplay(qcTaskClassification, checkType)} />;
        },
      },
      {
        title: changeChineseToLocale('创建时间'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 100,
        render: createdAt => (createdAt ? <span>{formatDateTime(createdAt)}</span> : replaceSign),
      },
      {
        title: changeChineseToLocale('工位'),
        dataIndex: 'workstation',
        width: 100,
        render: data => {
          const { name } = data || {};

          return <span> {name || replaceSign} </span>;
        },
      },
      {
        title: changeChineseToLocale('执行人'),
        dataIndex: 'operatorName',
        key: 'operatorName',
        width: 100,
        render: operatorName => (operatorName ? <span>{operatorName || replaceSign}</span> : replaceSign),
      },
      {
        title: changeChineseToLocale('工序编号/工序名称'),
        dataIndex: 'task',
        key: 'task',
        width: 140,
        render: (task, record) => {
          if (!task) return replaceSign;
          const {
            task: { processCode, processName },
          } = record;
          return (
            <Link
              onClick={() => window.open(`/bom/newProcess/${encodeURIComponent(processCode)}/detail`, '_blank')}
            >{`${processCode || replaceSign}/${processName || replaceSign}`}</Link>
          );
        },
      },
      {
        title: changeChineseToLocale('开始时间'),
        dataIndex: 'startTime',
        key: 'startTime',
        width: 100,
        render: startTime => {
          if (!startTime) return replaceSign;

          const _time = moment(startTime).format('YYYY/MM/DD HH:mm');
          return <span>{_time}</span>;
        },
      },
      {
        title: changeChineseToLocale('结束时间'),
        dataIndex: 'endTime',
        key: 'endTime',
        width: 100,
        render: endTime => {
          if (!endTime) return replaceSign;

          const _time = moment(endTime).format('YYYY/MM/DD HH:mm');
          return <span>{_time}</span>;
        },
      },
      {
        title: changeChineseToLocale('样本：抽样数/次品/不合格率'),
        dataIndex: 'checkCount',
        width: 170,
        render: (count, record) => {
          const { sampleDefectRate, sampleDefectCount, status } = record;
          if (status === 0) return replaceSign;
          const checkCount = typeof count === 'number' ? thousandBitSeparator(count) : replaceSign;
          const defectCount =
            typeof sampleDefectCount === 'number' ? thousandBitSeparator(sampleDefectCount) : replaceSign;
          const display = `${checkCount}/${defectCount}/${getDefect(sampleDefectRate)}`;
          return <span>{display}</span>;
        },
      },
      {
        title: changeChineseToLocale('总体：总数/次品/不合格率'),
        dataIndex: 'qcTotal',
        width: 170,
        render: (count, record) => {
          const { checkDefectRate, checkDefectCount, status } = record;
          if (status !== 2) return replaceSign;
          const qcTotal = typeof count === 'number' ? thousandBitSeparator(count) : replaceSign;
          const defectCount =
            typeof checkDefectCount === 'number' ? thousandBitSeparator(checkDefectCount) : replaceSign;
          const display = `${qcTotal}/${defectCount}/${getDefect(checkDefectRate)}`;
          return <span>{display}</span>;
        },
      },
      {
        title: changeChineseToLocale('订单编号'),
        dataIndex: 'purchaseOrderCode',
        width: 100,
        render: purchaseOrderCode => {
          if (!purchaseOrderCode) return replaceSign;
          return (
            <Link
              onClick={() =>
                window.open(
                  `/cooperate/purchaseOrders/${encodeURIComponent(purchaseOrderCode)}/detail?code=${purchaseOrderCode}`,
                  '_blank',
                )
              }
            >
              {purchaseOrderCode}
            </Link>
          );
        },
      },
      {
        title: changeChineseToLocale('项目编号'),
        dataIndex: 'task.projectCode',
        key: 'task.projectCode',
        width: 130,
        render: (projectCode, record) => {
          if (!projectCode) return replaceSign;
          return (
            <Link
              onClick={() => window.open(`/cooperate/projects/${encodeURIComponent(projectCode)}/detail`, '_blank')}
            >
              {projectCode}
            </Link>
          );
        },
      },
      {
        title: '操作',
        width: 140,
        fixed: 'right',
        render: ({ code, qcConfig }, record) => {
          const qcConfigName = _.get(qcConfig, 'name', replaceSign);
          const scrapInspection = _.get(qcConfig, 'scrapInspection', false);
          const params = { taskCode: code, scrapInspection, qcConfigName };

          return (
            <div style={{ display: 'flex' }}>
              <LinkWithAuth
                auth={auth.WEB_VIEW_QUALITY_TESTING_TASK}
                style={{ marginRight: 10 }}
                onClick={() => {
                  this.context.router.history.push(`/qualityManagement/qcReportAudit/detail/${code}`);
                }}
              >
                查看
              </LinkWithAuth>
              <PassQcReportAuditLink
                style={LINK_STYLE}
                params={params}
                refetchData={this.fetchData}
                taskData={record}
              />
              <RejectQcReportAuditLink
                style={LINK_STYLE}
                params={params}
                refetchData={this.fetchData}
                taskData={record}
              />
              <QcTaskOperationLogLink auth={auth.WEB_VIEW_QUALITY_TESTING_TASK} code={code} />
            </div>
          );
        },
      },
    ];
  };

  onSearch = () => {
    const { form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (sensors) {
          sensors.track('web_quanlity_reportCheckList_search', {
            FilterCondition: values,
          });
        }
        this.fetchData({ ...values, page: 1, size: 10 });
      }
    });
  };

  fetchData = async params => {
    this.setState({
      loading: true,
    });

    // 因为需要对data做了format，所以提前setLocation
    setLocation(this.props, p => ({ ...p, ...params }));

    const query = getQuery(this.props.match);

    // 质检报告审核列表默认只显示状态为「审核中」的质检任务
    await queryQcTaskList({
      ...formatQcTaskListFilterData({ ...query, ...params, status: QCTASK_STATUS_AUDITING }),
      size: params ? params.pageSize : 10,
    })
      .then(({ data: { data, total } }) => {
        this.setState({
          dataSource: data,
          total,
        });
      })
      .catch(e => console.log(e))
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { loading, dataSource, total } = this.state;
    const { changeChineseToLocale } = this.context;
    const columns = this.getColumns();

    return (
      <div>
        <FilterSortSearchBar style={{ backgroundColor: white, width: '100%' }} searchDisabled>
          <ItemList>
            <Item label="任务编号">{getFieldDecorator('qcTaskCode')(<Input placeholder="请输入任务编号" />)}</Item>
            <Item label="类型">
              {getFieldDecorator('checkType', {
                initialValue: 'all',
              })(
                <Select>
                  <Option key="all">
                    <Text>全部</Text>
                  </Option>
                  {Object.keys(CHECK_TYPE).map(x => (
                    <Option key={x}>
                      <Text>{CHECK_TYPE[x]}</Text>
                    </Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item label="工位">
              {getFieldDecorator('workStation')(
                <WorkstationAndAreaSelect
                  onlyWorkstations
                  params={{ enabled: null }}
                  style={{ width: '100%' }}
                  placeholder={changeChineseToLocale('请选择区域')}
                />,
              )}
            </Item>
            <Item label="执行人">
              {getFieldDecorator('operator')(
                <SearchSelect labelInValue placeholder="请选择执行人" type="qcMembers" className="select-input" />,
              )}
            </Item>
            <Item label="工序">
              {getFieldDecorator('process')(
                <SearchSelect placeholder="请选择工序" type="processName" params={{ status: null }} />,
              )}
            </Item>
            <Item label="物料">
              {getFieldDecorator('material')(<SearchSelect placeholder="请选择物料" type="materialBySearch" />)}
            </Item>
            <Item label="订单编号">
              {getFieldDecorator('purchaseOrderCode')(
                <SearchSelect placeholder="请输入订单编号" type="purchaseOrder" />,
              )}
            </Item>
            <Item label="项目编号">
              {getFieldDecorator('projectCode')(<SearchSelect type={'project'} placeholder="请输入项目编号" />)}
            </Item>
            <Item label="任务开始时间">{getFieldDecorator('taskStartTime')(<DatePicker.RangePicker />)}</Item>
            <Item label="质检计划">
              {getFieldDecorator('qcPlanCode')(
                <SearchSelect type="qcPlan" labelInValue={false} placeholder="请输入质检计划编号" />,
              )}
            </Item>
            <Item label="质检方案">{getFieldDecorator('qcConfigName')(<Input placeholder="请输入质检方案" />)}</Item>
            <Item label="任务结束时间">{getFieldDecorator('taskEndTime')(<DatePicker.RangePicker />)}</Item>
          </ItemList>
          <ButtonWithAuth icon="search" onClick={this.onSearch}>
            查询
          </ButtonWithAuth>
          <Link
            style={{ lineHeight: '30px', height: '28px', color: '#8C8C8C', paddingLeft: 16 }}
            onClick={() => {
              this.props.form.resetFields();
              this.onSearch();
            }}
          >
            重置
          </Link>
        </FilterSortSearchBar>
        <RestPagingTable
          dragable
          loading={loading}
          dataSource={dataSource}
          rowKey={record => record.code}
          columns={columns}
          total={total}
          refetch={this.fetchData}
          scroll={{ x: 2300 }}
          showPageSizeChanger
          showTotalAmount
        />
      </div>
    );
  }
}

QcTaskList.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseToLocale: PropTypes.func,
};

export default withForm({}, withRouter(QcTaskList));
