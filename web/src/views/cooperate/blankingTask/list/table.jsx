import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { formatDateHour, format } from 'utils/time';
import { getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import { Link, Table, Spin, Icon, Popover, FormattedMessage } from 'src/components';
import { error, processing, border, warning, fontSub, red } from 'styles/color';
import { thousandBitSeparator } from 'utils/number';
import { replaceSign, PROJECT_STATUS } from 'src/constants';
import AUTH from 'utils/auth';
import { getOutputMaterialInfo } from 'src/services/cooperate/blankingTask';
import _ from 'lodash';
import CONSTANT from '../constant';
import styles from '../styles.scss';

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
    outputMaterialList: [],
    fetchingOutputMaterialList: false,
  };

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    const taskDispatchType = config.config_task_dispatch_type.configValue;
    this.setState({ taskDispatchType });
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.props.refetch({ page: pagination && pagination.current, size: (pagination && pagination.pageSize) || 10 });
  };

  getOutputMaterialInfo = _.throttle(projectCode => {
    this.setState({ fetchingOutputMaterialList: true, outputMaterialList: [] });

    getOutputMaterialInfo(encodeURIComponent(projectCode))
      .then(result => {
        const list = _.get(result, 'data.data', []);
        setTimeout(() => {
          this.setState({ outputMaterialList: list, fetchingOutputMaterialList: false });
        }, 500);
      })
      .catch(err => {
        this.setState({ outputMaterialList: [], fetchingOutputMaterialList: false });
      });
  }, 2000);

  resetOutputMaterialInfo = _.throttle(() => {
    this.setState({ fetchingOutputMaterialList: false });
  }, 2000);

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
        title: '下料物料',
        dataIndex: 'projectInputMaterialList',
        width: 150,
        key: 'projectInputMaterialList',
        type: 'projectInputMaterialList',
        fixed: 'left',
        render: projectInputMaterialList => {
          return projectInputMaterialList.length > 0
            ? projectInputMaterialList.map(({ code, name }) => `${code}/${name}`).join('、')
            : replaceSign;
        },
      },
      {
        title: '任务编号',
        dataIndex: 'taskCode',
        key: 'taskCode',
        type: 'purchaseOrderNo',
        width: 150,
        fixed: 'left',
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
        title: '下料进度',
        dataIndex: 'progress',
        key: 'progress',
        width: 100,
        render: (_, record) => {
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
        title: '产出物料',
        dataIndex: 'projectOutputMaterialList',
        key: 'projectOutputMaterialList',
        width: 200,
        render: (projectOutputMaterialList, record) => {
          const { outputMaterialList, fetchingOutputMaterialList } = this.state;
          const columns = [
            {
              title: '物料编号/物料名称',
              dataIndex: 'materialCode',
              key: 'materialCode',
              render: (_, record) =>
                `${record.materialCode}/${record.materialName}${record.materialName}` || replaceSign,
            },
            {
              title: '数量',
              dataIndex: 'sum',
              key: 'sum',
              width: 80,
              render: sum => sum || replaceSign,
            },
            {
              title: '单位',
              dataIndex: 'unit',
              key: 'unit',
              width: 50,
              render: unit => unit || replaceSign,
            },
          ];

          const content = fetchingOutputMaterialList ? (
            <div style={{ width: 500, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Spin size="small" />
            </div>
          ) : (
            <Table
              bordered
              style={{ width: 500, margin: 0 }}
              dataSource={outputMaterialList}
              columns={columns}
              pagination={false}
            />
          );
          return (
            <Popover content={content} placement="bottomLeft" trigger="hover">
              <p
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => this.getOutputMaterialInfo(record.projectCode)}
                onMouseLeave={this.resetOutputMaterialInfo}
              >
                <FormattedMessage
                  defaultMessage={'{amount}种'}
                  values={{ amount: projectOutputMaterialList.length ? projectOutputMaterialList.length : 0 }}
                />

                <Icon iconType="gc" className={styles.materialDownIcon} type="zhankai-jiantou" size={10} />
              </p>
            </Popover>
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
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        fixed: 'right',
        width: 140,
        render: (_, { id, status }) => {
          return (
            <div>
              <Link style={{ marginRight: 20 }} to={`/cooperate/blankingTasks/detail/${id}`}>
                查看
              </Link>
              {[1, 2, 3].indexOf(status) >= 0 && (taskDispatchType === 'manager' || taskDispatchType === 'worker') ? (
                <Link
                  auth={AUTH.WEB_EDIT_PRODUCE_TASK}
                  style={{ marginRight: 20 }}
                  to={`/cooperate/blankingTasks/editTask/${id}`}
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
    const columns = _.compact(this.getTableColumns(taskDispatchType));

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
