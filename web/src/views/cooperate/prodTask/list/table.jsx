import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment, { formatDateHour, format } from 'utils/time';
import { getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import { withForm, Link, Table, Tooltip, Spin, Icon } from 'src/components';
import { error, processing, border, warning, fontSub, red } from 'styles/color';
import { thousandBitSeparator } from 'utils/number';
import { replaceSign, TASK_CATEGORY_PROD, PROJECT_STATUS } from 'src/constants';
import AUTH from 'utils/auth';
import { toProdTaskDetail } from '../navigation';
import CONSTANT from '../constant';

const circleStyle = {
  borderWidth: 4,
  borderStyle: 'solid',
  borderRadius: '50%',
  marginRight: 5,
};

const SORT_ORDER = {
  ASC: 0,
  DESC: 1,
};

type Props = {
  form: {},
  data: {},
  refetch: () => {},
  pagination: {},
  loading: boolean,
  onSelectChange: () => void,
  selectedRowKeys: [],
  showRowSelection: false,
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

  handleTableChange = (pagination, filters, sorter) => {
    if (sorter && sorter.columnKey) {
      const { order } = sorter;
      this.setState({ sortInfo: sorter });
      let sortByKey = null;
      switch (sorter.columnKey) {
        case 'projectOutputMaterial':
          sortByKey = 'projectProductCode';
          break;
        case 'outputMaterial':
          sortByKey = 'outputMaterialCode';
          break;
        default:
          sortByKey = sorter.columnKey;
          break;
      }
      this.props.refetch({
        page: pagination && pagination.current,
        order: order === 'ascend' ? SORT_ORDER.ASC : SORT_ORDER.DESC,
        sortBy: sortByKey,
        size: (pagination && pagination.pageSize) || 10,
      });
    } else {
      this.props.refetch({ page: pagination && pagination.current, size: (pagination && pagination.pageSize) || 10 });
    }
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
        sorter: true,
        render: projectCode => {
          return projectCode || replaceSign;
        },
      },
      {
        title: '成品物料编号／名称',
        dataIndex: 'projectOutputMaterial',
        width: 150,
        key: 'projectOutputMaterial',
        type: 'projectOutputMaterial',
        fixed: 'left',
        sorter: true,
        render: (outputMaterial, { category, projectOutputMaterialList = [] }) => {
          if (category === CONSTANT.CATEGORY_BAITING) {
            return projectOutputMaterialList.length > 0
              ? projectOutputMaterialList.map(({ code, name }) => `${code}/${name}`).join('、')
              : replaceSign;
          }
          return outputMaterial ? `${outputMaterial.code}／${outputMaterial.name}` : replaceSign;
        },
      },
      {
        title: '任务编号',
        dataIndex: 'taskCode',
        key: 'taskCode',
        type: 'purchaseOrderNo',
        width: 150,
        fixed: 'left',
        sorter: true,
        render: (taskCode, row) => {
          const { priority } = row;
          if (priority === CONSTANT.TASK_PRIORITIZED) {
            return (
              <div>
                <span>{taskCode || replaceSign}</span>
                <Icon type="xian" iconType="gc" style={{ color: red, marginLeft: 3, fontSize: 14 }} />
              </div>
            );
          }
          return taskCode || replaceSign;
        },
      },
      {
        title: '产出物料编号／名称',
        dataIndex: 'category',
        key: 'outputMaterial',
        width: 200,
        sorter: true,
        render: (category, { outputMaterial, projectOutputMaterialList = [] }) => {
          if (category === CONSTANT.CATEGORY_BAITING) {
            return projectOutputMaterialList.length > 0
              ? projectOutputMaterialList.map(({ code, name }) => `${code}/${name}`).join('、')
              : replaceSign;
          }
          return outputMaterial ? `${outputMaterial.code}／${outputMaterial.name}` : replaceSign;
        },
      },
      {
        title: '成品批次',
        key: 'productBatch',
        width: 150,
        render: (_, { productBatchType, productBatch }) => {
          if (productBatchType !== 1) {
            return replaceSign;
          }
          return <Tooltip text={productBatch == null ? replaceSign : productBatch} length={10} />;
        },
      },
      {
        title: '状态',
        dataIndex: 'statusDisplay',
        key: 'statusDisplay',
        width: 100,
        render: (statusDisplay, record) => {
          const { endDelayed } = record;
          let circleColor = '';
          switch (statusDisplay) {
            case '未开始':
              circleColor = border;
              break;
            case '执行中':
              circleColor = processing;
              break;
            case '暂停中':
              circleColor = warning;
              break;
            case '已结束':
              circleColor = error;
              break;
            case '已取消':
              circleColor = fontSub;
              break;
            default:
              circleColor = border;
          }
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ borderColor: circleColor, ...circleStyle }} />
              <span>{changeChineseToLocale(statusDisplay)}</span>
            </div>
          );
        },
      },
      {
        title: '进度',
        dataIndex: 'startTimePlanned',
        key: 'progress',
        width: 100,
        render: (startTimePlanned, record) => {
          const { amountProductQualified, amountProductPlanned } = record;
          return (
            <span>
              {thousandBitSeparator(amountProductQualified)}
              {amountProductPlanned ? `/${thousandBitSeparator(amountProductPlanned)}` : null}
            </span>
          );
        },
      },
      {
        title: '工序编号/名称',
        dataIndex: 'processCode',
        key: 'processCode',
        width: 226,
        sorter: true,
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
        sorter: true,
        render: time => (time ? format(time) : replaceSign),
      },
      {
        title: '实际结束时间',
        dataIndex: 'endTimeReal',
        key: 'endTimeReal',
        width: 120,
        sorter: true,
        render: time => (time ? format(time) : replaceSign),
      },
      taskDispatchType === 'manager'
        ? {
            title: '计划开始时间',
            dataIndex: 'startTimePlanned',
            key: 'startTimePlanned',
            type: 'operationDate',
            width: 140,
            sorter: true,
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
            sorter: true,
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
        render: (_, { id, status, category }) => {
          return (
            <div>
              <Link style={{ marginRight: 20 }} to={toProdTaskDetail({ id, category })}>
                查看
              </Link>
              {[1, 2, 3].indexOf(status) >= 0 && (taskDispatchType === 'manager' || taskDispatchType === 'worker') ? (
                <Link
                  auth={AUTH.WEB_EDIT_PRODUCE_TASK}
                  style={{ marginRight: 20 }}
                  to={`/cooperate/prodTasks/editTask/${id}`}
                >
                  编辑
                </Link>
              ) : null}
            </div>
          );
        },
      },
    ];
  };

  getRowSelection() {
    const { onSelectChange, selectedRowKeys, showRowSelection } = this.props;
    if (!showRowSelection) {
      return null;
    }
    return {
      selectedRowKeys,
      onChange: onSelectChange,
      getCheckboxProps: row => ({
        disabled:
          row.priority === CONSTANT.TASK_PRIORITIZED ||
          row.statusDisplay === PROJECT_STATUS[4] ||
          row.statusDisplay === PROJECT_STATUS[5],
      }),
    };
  }

  render() {
    const { data, pagination, loading } = this.props;
    const { taskDispatchType } = this.state;
    const columns = this.getTableColumns(taskDispatchType).filter(n => n);

    return (
      <Spin spinning={loading}>
        <Table
          style={{ marginTop: 68 }}
          tableUniqueKey={CONSTANT.TABLE_UNIQUE_KEY}
          useColumnConfig
          bordered
          dragable
          dataSource={(data && data.data) || []}
          pagination={pagination}
          columns={columns}
          rowKey={record => record.id}
          onChange={this.handleTableChange}
          rowSelection={this.getRowSelection()}
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
