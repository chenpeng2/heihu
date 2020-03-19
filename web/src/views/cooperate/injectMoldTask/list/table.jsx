import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment, { formatDateHour, format } from 'utils/time';
import { getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import { withForm, Link, Table, Tooltip, Spin } from 'src/components';
import { error, processing, border, warning, fontSub } from 'styles/color';
import { replaceSign } from 'src/constants';
import AUTH from 'utils/auth';
import { toProdTaskDetail } from 'views/cooperate/prodTask/navigation';
import CONSTANT from 'views/cooperate/prodTask/constant';

const circleStyle = {
  borderWidth: 4,
  borderStyle: 'solid',
  borderRadius: '50%',
  marginRight: 5,
};

type Props = {
  form: {},
  data: {},
  refetch: () => {},
  pagination: {},
  loading: boolean,
};

class ProdTaskList extends Component {
  props: Props;
  state = {
    taskDispatchType: null,
  };

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    const taskDispatchType = config.config_task_dispatch_type.configValue;
    this.setState({ taskDispatchType });
  }

  handleTableChange = pagination => {
    this.props.refetch({
      page: pagination && pagination.current,
      size: (pagination && pagination.pageSize) || 10,
    });
  };

  getTableColumns = taskDispatchType => {
    const { router, changeChineseToLocale } = this.context;
    return [
      {
        title: '项目编号',
        dataIndex: 'projectCode',
        key: 'projectCode',
        width: 150,
        type: 'purchaseOrderNo',
        fixed: 'left',
        render: projectCode => {
          return projectCode || replaceSign;
        },
      },
      {
        title: '任务编号',
        dataIndex: 'taskCode',
        key: 'taskCode',
        type: 'purchaseOrderNo',
        width: 150,
        fixed: 'left',
        render: taskCode => {
          return taskCode || replaceSign;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status, record) => {
          const { endDelayed } = record;
          let circleColor = '';
          switch (status) {
            case 1:
              circleColor = border;
              break;
            case 2:
              circleColor = processing;
              break;
            case 3:
              circleColor = warning;
              break;
            case 4:
              circleColor = error;
              break;
            case 5:
              circleColor = fontSub;
              break;
            default:
              circleColor = border;
          }
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ borderColor: circleColor, ...circleStyle }} />
              <span style={endDelayed && status !== 5 ? { color: error } : {}}>
                {changeChineseToLocale(CONSTANT.taskStatusMap.get(status))}
              </span>
            </div>
          );
        },
      },
      {
        title: '产出物料编号／名称',
        dataIndex: 'outputMaterials',
        key: 'outputMaterial',
        width: 200,
        render: outputMaterials => {
          return (
            outputMaterials &&
            outputMaterials.map(({ code, name }) => (
              <Link to={`/bom/materials/${encodeURIComponent(code)}/detail`}>{`${code}/${name}`}</Link>
            ))
          );
        },
      },
      {
        title: '工序编号/名称',
        dataIndex: 'processCode',
        key: 'processCode',
        width: 226,
        render: (processCode, record) => {
          return `${processCode || replaceSign}/${record.processName || replaceSign}`;
        },
      },
      {
        title: '工位',
        dataIndex: 'workstation',
        key: 'workstation',
        width: 100,
        render: workstation => {
          return (workstation && workstation.name) || replaceSign;
        },
      },
      {
        title: '执行人',
        dataIndex: 'operators',
        key: 'operators',
        width: 120,
        render: operators =>
          operators && operators.length > 0 ? operators.map(operator => operator.name).join('，') : replaceSign,
      },
      {
        title: '实际开始时间',
        dataIndex: 'startTimeReal',
        key: 'startTimeReal',
        width: 120,
        render: time => (time ? format(time) : replaceSign),
      },
      {
        title: '实际结束时间',
        dataIndex: 'endTimeReal',
        key: 'endTimeReal',
        width: 120,
        render: time => (time ? format(time) : replaceSign),
      },
      taskDispatchType === 'manager'
        ? {
            title: '计划开始时间',
            dataIndex: 'startTimePlanned',
            key: 'startTimePlanned',
            type: 'operationDate',
            width: 140,
            render: startTimePlanned => (startTimePlanned ? formatDateHour(startTimePlanned) : replaceSign),
          }
        : null,
      taskDispatchType === 'manager'
        ? {
            title: '计划结束时间',
            dataIndex: 'endTimePlanned',
            key: 'endTimePlanned',
            type: 'operationDate',
            width: 140,
            render: endTimePlanned => (endTimePlanned ? formatDateHour(endTimePlanned) : replaceSign),
          }
        : null,
      {
        title: '审批备注',
        width: 180,
        dataIndex: 'auditInfo.auditors',
        render: auditors => {
          const notNullRemarks = Array.isArray(auditors) && auditors.filter(e => e.remark);
          return notNullRemarks.length ? notNullRemarks.map(e => `${e.remark}(${e.name})`).join(';') : replaceSign;
        },
      },
      {
        title: '操作',
        dataIndex: 'operationDetail',
        key: 'operation',
        fixed: 'right',
        width: 140,
        render: (_, { id, status }) => {
          return (
            <div>
              <Link style={{ marginRight: 20 }} to={toProdTaskDetail({ id, category: CONSTANT.CATEGORY_INJECT_MOLD })}>
                查看
              </Link>
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { data, pagination, loading } = this.props;
    const { taskDispatchType } = this.state;
    const columns = this.getTableColumns(taskDispatchType).filter(n => n);

    return (
      <Spin spinning={loading}>
        <Table
          style={{ marginTop: 68 }}
          tableUniqueKey={'InjectMoldTaskTableConfig'}
          useColumnConfig
          bordered
          dragable
          dataSource={(data && data.data) || []}
          pagination={pagination}
          columns={columns}
          rowKey={record => record.id}
          onChange={this.handleTableChange}
        />
      </Spin>
    );
  }
}

ProdTaskList.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseToLocale: PropTypes.func,
};

export default ProdTaskList;
