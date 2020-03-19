import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { replaceSign, MaxProjectCodeLength } from 'src/constants';
import { setLocation } from 'utils/url';
import { withForm, Link, RestPagingTable, Tooltip, Spin, message, Badge, Button } from 'components';
import { error, border, warning, fontSub, primary, blueViolet } from 'styles/color';
import { stringEllipsis } from 'utils/string';
import { exportXlsxFile } from 'utils/exportFile';
import { getProjectReportList } from 'src/services/cooperate/project';
import { queryProdTaskReportsList } from 'src/services/cooperate/prodTask';
import { getPathname, getQuery, getState } from 'src/routes/getRouteParams';
import { formatDate, formatTodayUnderline, formatRangeUnix } from 'utils/time';
import { thousandBitSeparator } from 'src/utils/number';
import FilterForProdReportsList from './filter';
import styles from '../styles.scss';

const MyBadge = Badge.MyBadge;

type Props = {
  form: {
    resetFields: () => {},
    getFieldsValue: () => {},
  },
  data: {},
  match: {},
  loading: boolean,
  total: Number,
};

class ProdReportsList extends Component {
  props: Props;
  // 父表格请求参数
  formRequestParams;

  state = {
    projectCode: null,
    purchaseOrderCode: null,
    pagination: {},
    subPagination: {},
    searched: false,
    data: [],
    subData: [],
    total: 0,
    subTotal: 0,
    loading: false,
    subLoading: false,
    exportData: [],
    subExportData: [],
    sortInfo: {},
    subSortInfo: {},
  };

  componentDidMount() {
    this.setState({
      pagination: {
        current: 1,
      },
      exportData: [],
    });
  }

  getColumns = sortInfo => {
    const { router, changeChineseToLocale } = this.context;
    const { match } = this.props;
    return [
      {
        title: '项目编号',
        dataIndex: 'projectCode',
        key: 'projectCode',
        type: 'purchaseOrderNo',
        fixed: 'left',
        sorter: true,
        sortOrder: sortInfo.columnKey === 'projectCode' && sortInfo.order,
        render: (projectCode, record) => {
          return (
            <Link
              onClick={() => {
                const variables = { ...getQuery(match) };

                // 点击子项目的时候 保留父项目的参数 防止父项目数据导出丢失参数
                this.formRequestParams = variables;
                this.setState(
                  {
                    projectCode,
                    purchaseOrderCode: record.purchaseOrderCode,
                  },
                  () => {
                    this.fetchSubData(false, {
                      projectCode,
                      sortBy: 'processSeq',
                      order: 0,
                      size: 10,
                      page: 1,
                      subStatus: 6,
                    });
                    window.location.hash = '#subTable';
                  },
                );
              }}
              key={`reportsList-${projectCode}`}
            >
              <Tooltip text={projectCode || replaceSign} length={15} />
            </Link>
          );
        },
      },
      {
        title: '订单号',
        dataIndex: 'purchaseOrderCode',
        key: 'purchaseOrderCode',
        width: 170,
        sorter: true,
        sortOrder: sortInfo.columnKey === 'purchaseOrderCode' && sortInfo.order,
        render: (purchaseOrderCode, record) => {
          return (
            <div key={`purchOrderNo-${record.id}`}>
              {purchaseOrderCode ? (
                <Tooltip placement="top" title={purchaseOrderCode}>
                  <span>{stringEllipsis(purchaseOrderCode, MaxProjectCodeLength)}</span>
                </Tooltip>
              ) : (
                replaceSign
              )}
            </div>
          );
        },
      },
      {
        title: '物料编号/名称',
        dataIndex: 'productCode',
        key: 'productCode',
        width: 160,
        sorter: true,
        sortOrder: sortInfo.columnKey === 'productCode' && sortInfo.order,
        render: (productCode, { productName }) => {
          return (
            <Tooltip
              text={`${productCode}/${productName}`}
              length={20}
              onLink
              linkProps={{
                onClick: () => window.open(`/bom/materials/${encodeURIComponent(productCode)}/detail`),
              }}
            />
          );
        },
        exportData: (productCode, { productName }) => `${productCode}/${productName}`,
      },
      {
        title: '物料描述',
        dataIndex: 'productDesc',
        width: 160,
        key: 'productDesc',
        render: productDesc => <Tooltip text={productDesc} length={20} />,
      },
      {
        title: '单位',
        dataIndex: 'unit',
        key: 'unit',
        width: 100,
        render: unit => (unit ? <Tooltip text={unit} length={8} /> : replaceSign),
      },
      {
        title: '计划数量',
        dataIndex: 'amountProductPlanned',
        key: 'amountProductPlanned',
        className: 'column-numeric',
        width: 100,
        render: amountProductPlanned => {
          const num = amountProductPlanned === null ? replaceSign : amountProductPlanned;
          return <Tooltip text={num && thousandBitSeparator(num.toString())} length={10} />;
        },
        exportData: amountProductPlanned => amountProductPlanned,
      },
      {
        title: '完成数量',
        dataIndex: 'amountProductCompleted',
        key: 'amountProductCompleted',
        className: 'column-numeric',
        width: 100,
        render: amountProductCompleted => {
          const num = amountProductCompleted === null ? replaceSign : amountProductCompleted;
          return <Tooltip text={num && thousandBitSeparator(num.toString())} length={10} />;
        },
        exportData: amountProductCompleted => amountProductCompleted,
      },
      {
        title: '计划开始时间',
        type: 'date',
        dataIndex: 'startTimePlanned',
        key: 'startTimePlanned',
        width: 150,
        sorter: true,
        sortOrder: sortInfo.columnKey === 'startTimePlanned' && sortInfo.order,
        render: startTimePlanned => {
          return startTimePlanned ? formatDate(startTimePlanned) : replaceSign;
        },
        exportData: startTimePlanned => {
          return startTimePlanned ? formatDate(startTimePlanned) : replaceSign;
        },
      },
      {
        title: '计划结束时间',
        type: 'date',
        dataIndex: 'endTimePlanned',
        key: 'endTimePlanned',
        width: 150,
        sorter: true,
        sortOrder: sortInfo.columnKey === 'endTimePlanned' && sortInfo.order,
        render: endTimePlanned => (endTimePlanned ? formatDate(endTimePlanned) : replaceSign),
        exportData: endTimePlanned => (endTimePlanned ? formatDate(endTimePlanned) : replaceSign),
      },
      {
        title: '项目状态',
        key: 'status',
        dataIndex: 'status',
        sorter: true,
        width: 100,
        sortOrder: sortInfo.columnKey === 'status' && sortInfo.order,
        render: status => {
          if (status === '暂停中') {
            return <MyBadge text={status} color={warning} />;
          }
          if (status === '执行中') {
            return <MyBadge text={status} color={blueViolet} />;
          }
          if (status === '未开始') {
            return <MyBadge text={status} color={border} />;
          }
          if (status === '已结束') {
            return <MyBadge text={status} color={error} />;
          }
          if (status === '已取消') {
            return <MyBadge text={status} color={fontSub} />;
          }
          return replaceSign;
        },
      },
      {
        title: '项目延期结束',
        dataIndex: 'endDelay',
        key: 'endDelay',
        width: 100,
        render: endDelay => {
          return (
            <span style={{ color: endDelay === '延期' ? error : primary }}>{changeChineseToLocale(endDelay)}</span> ||
            replaceSign
          );
        },
      },
      {
        title: '实际开始时间',
        dataIndex: 'startTimeReal',
        key: 'startTimeReal',
        sorter: true,
        width: 150,
        sortOrder: sortInfo.columnKey === 'startTimeReal' && sortInfo.order,
        render: startTimeReal => (startTimeReal ? formatDate(startTimeReal) : replaceSign),
        exportData: startTimeReal => (startTimeReal ? formatDate(startTimeReal) : replaceSign),
      },
      {
        title: '实际结束时间',
        dataIndex: 'endTimeReal',
        key: 'endTimeReal',
        sorter: true,
        width: 150,
        sortOrder: sortInfo.columnKey === 'endTimeReal' && sortInfo.order,
        render: endTimeReal => (endTimeReal ? formatDate(endTimeReal) : replaceSign),
        exportData: endTimeReal => (endTimeReal ? formatDate(endTimeReal) : replaceSign),
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        sorter: true,
        width: 150,
        sortOrder: sortInfo.columnKey === 'createdAt' && sortInfo.order,
        render: (createdAt, record) => (createdAt ? formatDate(createdAt) : replaceSign),
        exportData: createdAt => (createdAt ? formatDate(createdAt) : replaceSign),
      },
    ];
  };

  getSubColumns = sortInfo => {
    const { router, changeChineseToLocale } = this.context;
    return [
      {
        title: '生产任务编号',
        dataIndex: 'taskCode',
        key: 'taskCode',
        type: 'taskCode',
        fixed: 'left',
        width: 150,
        sorter: true,
        sortOrder: sortInfo.columnKey === 'taskCode' && sortInfo.order,
        render: taskCode => {
          return <Tooltip text={taskCode || replaceSign} length={15} />;
        },
      },
      {
        title: '工序序号/工序名称',
        dataIndex: 'processSeq',
        key: 'processSeq',
        sorter: true,
        width: 150,
        sortOrder: sortInfo.columnKey === 'processSeq' && sortInfo.order,
        render: (processSeq, record) => {
          const title = `${stringEllipsis(processSeq, 15) || replaceSign}/${stringEllipsis(record.processName, 15) ||
            replaceSign}`;
          return (
            <Tooltip placement="top" title={title}>
              <span>{title}</span>
            </Tooltip>
          );
        },
      },
      {
        title: '工位',
        dataIndex: 'workstation',
        key: 'workstation',
        type: 'workstation',
        width: 150,
        sorter: true,
        sortOrder: sortInfo.columnKey === 'workstation' && sortInfo.order,
        render: workstation => {
          return <Tooltip text={workstation || replaceSign} length={10} />;
        },
      },
      {
        title: '执行人',
        dataIndex: 'operatorName',
        key: 'operatorName',
        type: 'operatorName',
        width: 150,
        render: operatorName => {
          return <Tooltip text={operatorName || replaceSign} length={10} />;
        },
      },
      {
        title: '计划数量',
        dataIndex: 'amountPlanned',
        key: 'amountPlanned',
        type: 'amountPlanned',
        className: 'column-numeric',
        width: 100,
        render: (amountPlanned, record) => {
          const num = amountPlanned === null ? replaceSign : amountPlanned;
          return <Tooltip text={num && num.toString()} length={10} />;
        },
      },
      {
        title: '完成数量',
        dataIndex: 'amountCompleted',
        key: 'amountCompleted',
        type: 'amountCompleted',
        className: 'column-numeric',
        width: 100,
        render: (amountCompleted, record) => {
          const num = amountCompleted === null ? replaceSign : amountCompleted;
          return <Tooltip text={num && num.toString()} length={10} />;
        },
      },
      // {
      //   title: '次品数量',
      //   dataIndex: 'amountProductFaulty',
      //   key: 'amountProductFaulty',
      //   type: 'amountProductFaulty',
      //   className: 'column-numeric',
      //   render: (amountProductFaulty, record) => amountProductFaulty === null ? replaceSign : amountProductFaulty,
      // },
      {
        title: '返工数量',
        dataIndex: 'amountReproduce',
        key: 'amountReproduce',
        type: 'amountReproduce',
        className: 'column-numeric',
        width: 100,
        render: (amountReproduce, record) => {
          const num = amountReproduce || replaceSign;
          return <Tooltip text={num && num.toString()} length={10} />;
        },
      },
      {
        title: '任务状态',
        dataIndex: 'status',
        key: 'status',
        type: 'status',
        sorter: true,
        width: 100,
        sortOrder: sortInfo.columnKey === 'status' && sortInfo.order,
        render: status => {
          if (status === '暂停中') {
            return <MyBadge text={status} color={warning} />;
          }
          if (status === '执行中') {
            return <MyBadge text={status} color={blueViolet} />;
          }
          if (status === '未开始') {
            return <MyBadge text={status} color={border} />;
          }
          if (status === '已结束') {
            return <MyBadge text={status} color={error} />;
          }
          if (status === '已取消') {
            return <MyBadge text={status} color={fontSub} />;
          }
          return replaceSign;
        },
      },
      {
        title: '任务延期结束',
        dataIndex: 'endDelay',
        key: 'endDelay',
        type: 'endDelay',
        width: 100,
        render: endDelay => {
          return (
            <span style={{ color: endDelay === '延期' ? error : primary }}>{changeChineseToLocale(endDelay)}</span> ||
            changeChineseToLocale(replaceSign)
          );
        },
      },
      {
        title: '任务计划开始时间',
        dataIndex: 'startTimePlanned',
        key: 'startTimePlanned',
        type: 'startTimePlanned',
        sorter: true,
        width: 150,
        sortOrder: sortInfo.columnKey === 'startTimePlanned' && sortInfo.order,
        render: (startTimePlanned, record) => {
          return startTimePlanned ? formatDate(startTimePlanned) : replaceSign;
        },
      },
      {
        title: '任务计划结束时间',
        dataIndex: 'endTimePlanned',
        key: 'endTimePlanned',
        type: 'endTimePlanned',
        sorter: true,
        width: 150,
        sortOrder: sortInfo.columnKey === 'endTimePlanned' && sortInfo.order,
        render: (endTimePlanned, record) => {
          return endTimePlanned ? formatDate(endTimePlanned) : replaceSign;
        },
      },
      {
        title: '任务实际开始时间',
        dataIndex: 'startTimeReal',
        key: 'startTimeReal',
        type: 'startTimeReal',
        sorter: true,
        width: 150,
        sortOrder: sortInfo.columnKey === 'startTimeReal' && sortInfo.order,
        render: (startTimeReal, record) => {
          return startTimeReal ? formatDate(startTimeReal) : replaceSign;
        },
      },
      {
        title: '任务实际结束时间',
        dataIndex: 'endTimeReal',
        key: 'endTimeReal',
        type: 'endTimeReal',
        sorter: true,
        width: 150,
        sortOrder: sortInfo.columnKey === 'endTimeReal' && sortInfo.order,
        render: (endTimeReal, record) => {
          return endTimeReal ? formatDate(endTimeReal) : replaceSign;
        },
      },
    ];
  };

  formatExportData = data => {
    return data.map(node => {
      return this.getColumns(this.state.sortInfo).map(({ dataIndex, exportData }) => {
        if (typeof exportData === 'function') {
          return exportData(node[dataIndex], node);
        }
        return node[dataIndex] || replaceSign;
      });
    });
  };

  formatSubExportData = data => {
    const _data = data.map(x => {
      return [
        this.state.projectCode,
        this.state.purchaseOrderCode || replaceSign,
        x.taskCode || replaceSign,
        `${x.processSeq}/${x.processName}` || replaceSign,
        x.workstation || replaceSign,
        x.operatorName || replaceSign,
        x.amountPlanned,
        x.amountCompleted,
        x.amountReproduce || replaceSign,
        x.status,
        x.endDelay,
        x.startTimePlanned ? formatDate(x.startTimePlanned) : replaceSign,
        x.endTimePlanned ? formatDate(x.endTimePlanned) : replaceSign,
        x.startTimeReal ? formatDate(x.startTimeReal) : replaceSign,
        x.endTimeReal ? formatDate(x.endTimeReal) : replaceSign,
      ];
    });
    return _data.map(x => Object.values(x));
  };

  dataExport = async () => {
    const { sortInfo } = this.state;
    const exportData = await this.getAndSetData(true, { size: 100 });
    const headers = this.getColumns(sortInfo).map(x => x.title);
    const values = this.formatExportData(exportData);
    exportXlsxFile([headers, ...values], `项目进度数据_${formatTodayUnderline()}`);
  };

  subDataExport = async () => {
    const { projectCode, subTotal, subSortInfo } = this.state;
    await this.fetchSubData(true, { projectCode, size: subTotal });
    const { subExportData } = this.state;
    let headers = this.getSubColumns(subSortInfo).map(x => x.title);
    headers = []
      .concat('项目号')
      .concat('销售订单号')
      .concat(this.getSubColumns(subSortInfo).map(x => x.title));
    const values = this.formatSubExportData(subExportData);
    exportXlsxFile([headers, ...values], `生产任务进度数据_${formatTodayUnderline()}`);
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { match } = this.props;
    this.setState({ loading: true, pagination, sortInfo: sorter });
    const query = this.props.form.getFieldsValue();
    if (Object.keys(sorter).length === 0) {
      sorter = {
        field: query.mainSortBy || 'startTimePlanned',
        order: (() => {
          if (!query.mainOrder || query.mainOrder === 'ascend') {
            return 'ascend';
          }
          return 'descend';
        })(),
      };
    } else {
      query.mainSortBy = sorter.field;
      query.mainOrder = sorter.order;
    }
    const variables = {
      ...query,
      size: pagination.pageSize,
      page: pagination.current,
      sortBy: sorter.field,
      order: sorter.order === 'ascend' ? 0 : 1,
    };

    this.getAndSetData(false, variables);
    this.setState({ loading: false, pagination });
  };

  handleSubTableChange = async (pagination, filters, sorter) => {
    this.setState({ subLoading: true });
    const { match } = this.props;
    const query = getQuery(match);
    if (Object.keys(sorter).length === 0) {
      sorter = {
        field: query.subSortBy || 'processSeq',
        order: (() => {
          if (!query.subOrder || query.subOrder === 'ascend') {
            return 'ascend';
          }
          return 'descend';
        })(),
      };
    } else {
      query.subSortBy = sorter.field;
      query.subOrder = sorter.order;
    }
    const variables = {
      ...query,
      size: 10,
      page: pagination.current,
      sortBy: sorter.field,
      order: sorter.order === 'ascend' ? 0 : 1,
    };
    await this.fetchSubData(false, variables);
    this.setState({ subLoading: false, subPagination: pagination, subSortInfo: sorter });
  };

  fetchSubData = async (exporting, params, query) => {
    if (exporting === false) {
      this.setState({ subLoading: true });
      const { match } = this.props;
      const _query = query || getQuery(match);
      const variables = Object.assign({}, { ..._query, ...params, status: params.subStatus });
      await queryProdTaskReportsList(variables)
        .then(res => {
          this.setState({
            subData: res && res.data.data,
            subTotal: res && res.data.total,
          });
        })
        .finally(() => {
          const { page, status, ...rest } = variables;
          this.setState({
            subLoading: false,
            subPagination: {
              total: this.state.subTotal,
              current: variables.page,
            },
          });
          setLocation(this.props, p => {
            return { ...p, ...rest };
          });
        });
      return this.state.subData;
    }
    if (exporting === true) {
      const { size } = params;
      const times = Math.ceil(size / 100);
      let subExportData = [];
      for (let i = 1; i <= times; i += 1) {
        const variables = Object.assign({}, { ...params, size: 100, page: i });
        const { data } = await queryProdTaskReportsList(variables)
          .then()
          .finally();
        const _data = data.data;
        subExportData = subExportData.concat(_data);
      }
      this.setState(
        {
          subExportData,
        },
        () => {
          return this.state.subExportData;
        },
      );
    }
  };

  getAndSetData = async (exporting, params, query) => {
    if (exporting === false) {
      const { match } = this.props;
      // 每次查询的时候 清空暂存的formRequestParams参数
      this.formRequestParams = null;
      const _query = query || getQuery(match);
      const variables = this.getFormatParams({ ..._query, ...params });
      variables.order = params.order;
      // variables.createdAt = createdAt && createdAt[0] ? formatToUnix(createdAt[0]) : undefined;
      // params.toAt = createdAt && createdAt[1] ? formatToUnix(createdAt[1]) : undefined;
      // if (variables.startTimePlannedTill && variables.endTimePlannedFrom && variables.startTimePlannedTill > variables.endTimePlannedFrom) {
      //   message.error('计划结束时间必须等于晚于计划开始时间');
      //   return null;
      // }
      // if (variables.startTimeRealTill && variables.endTimeRealFrom && variables.startTimeRealTill > variables.endTimeRealFrom) {
      //   message.error('实际结束时间必须等于晚于实际开始时间');
      //   return null;
      // }
      this.setState({ loading: true });
      await getProjectReportList(variables)
        .then(res => {
          this.setState({
            data: res && res.data,
            total: res && res.data.total,
          });
        })
        .finally(() => {
          this.setState({
            loading: false,
            pagination: {
              current: variables.page,
              total: this.state.total,
            },
          });
          const { page, ...rest } = variables;
          setLocation(this.props, () => {
            return { ...rest };
          });
        });
      return this.state.data;
    }
    if (exporting === true) {
      const { total } = this.state;
      const times = Math.ceil(total / 100);
      let exportData = [];
      const { match } = this.props;
      const _query = query || getQuery(match);
      for (let i = 1; i <= times; i += 1) {
        // 父项目数据导出如果有保留的formRequestParams则使用
        const _params = this.formRequestParams != null ? this.formRequestParams : { ..._query, ...params };
        const variables = { ..._params, size: 100, page: i };
        const { data } = await getProjectReportList(variables)
          .then()
          .finally();
        const _data = data.data;
        exportData = exportData.concat(_data);
      }
      return exportData;
    }
  };

  getFormatParams = value => {
    value.status = value.status && value.status.key;
    value.startTimePlanned = formatRangeUnix(value.startTimePlanned);
    value.endTimePlanned = formatRangeUnix(value.endTimePlanned);
    value.createdAt = formatRangeUnix(value.createdAt);
    value.startTimeReal = formatRangeUnix(value.startTimeReal);
    value.endTimeReal = formatRangeUnix(value.endTimeReal);
    const params = {};
    Object.keys(value).forEach(prop => {
      if (value[prop]) {
        switch (prop) {
          case 'status':
            params[prop] = Number(value[prop]);
            break;
          case 'productCode':
            params[prop] = value[prop].key;
            break;
          case 'projectCode':
            params[prop] = value[prop].key;
            break;
          case 'purchaseOrderCode':
            params[prop] = value[prop].key;
            break;
          case 'productName':
            params[prop] = value[prop].key;
            break;
          case 'startTimePlanned':
            params.startTimePlannedTill = value[prop][1];
            params.startTimePlannedFrom = value[prop][0];
            break;
          case 'endTimePlanned':
            params.endTimePlannedTill = value[prop][1];
            params.endTimePlannedFrom = value[prop][0];
            break;
          case 'createdAt':
            params.createdAtTill = value[prop][1];
            params.createdAtFrom = value[prop][0];
            break;
          case 'startTimeReal':
            params.startTimeRealTill = value[prop][1];
            params.startTimeRealFrom = value[prop][0];
            break;
          case 'endTimeReal':
            params.endTimeRealTill = value[prop][1];
            params.endTimeRealFrom = value[prop][0];
            break;
          default:
            params[prop] = value[prop];
        }
      }
    });
    if (params.status === 6) {
      delete params.status;
    }
    return params;
  };

  onSearch = () => {
    this.setState({
      projectCode: null,
      searched: true,
      sortInfo: {},
      subSortInfo: {},
    });
  };

  onReset = () => {
    this.setState({
      projectCode: null,
      searched: false,
    });
  };

  render() {
    const {
      data,
      loading,
      searched,
      total,
      projectCode,
      subData,
      subLoading,
      subTotal,
      pagination,
      subPagination,
      sortInfo,
      subSortInfo,
    } = this.state;
    const dataSource = data.data || [];
    const columns = this.getColumns(sortInfo);
    const subColumns = this.getSubColumns(subSortInfo);
    const { changeChineseToLocale } = this.context;
    const { form } = this.props;
    return (
      <Spin spinning={loading}>
        <div className={styles.reportsList}>
          <FilterForProdReportsList
            form={form}
            fetchData={this.getAndSetData}
            onReset={this.onReset}
            onSearch={this.onSearch}
          />
          {searched ? (
            <div style={{ marginTop: 20 }} className={styles.reportsListFilter}>
              <div>
                <div className={styles.contentHeader}>
                  <span>{changeChineseToLocale('项目信息')}</span>
                  <Button icon="upload" onClick={this.dataExport} disabled={total === 0}>
                    数据导出
                  </Button>
                </div>
                <RestPagingTable
                  bordered
                  dataSource={dataSource}
                  columns={columns}
                  rowKey={record => record.id}
                  total={total}
                  rowClassName={(record, index) => {
                    return this.state.projectCode === record.projectCode ? 'onRowClick' : '';
                  }}
                  scroll={{ x: 1800 }}
                  rowClassName={record => {
                    return this.state.projectCode === record.projectCode ? 'onRowClick' : null;
                  }}
                  pagination={pagination}
                  showPageSizeChanger
                  showQuickJumper
                  onChange={this.handleTableChange}
                />
              </div>
              {projectCode ? (
                <div
                  id="subTable"
                  style={{
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #E8E8E8',
                    borderRadius: 2,
                    margin: '60px 20px 25px',
                    paddingBottom: 60,
                  }}
                >
                  <div className={styles.subContentHeader}>
                    <div>
                      <span>{changeChineseToLocale('生产任务信息')}</span>
                      <span className={styles.subCodeHeader}>
                        {changeChineseToLocale('项目编号')}： {projectCode}
                      </span>
                    </div>
                    <Button icon="upload" onClick={this.subDataExport} disabled={subTotal === 0}>
                      数据导出
                    </Button>
                  </div>
                  <RestPagingTable
                    bordered
                    loading={subLoading}
                    dataSource={subData}
                    total={subTotal}
                    columns={subColumns}
                    rowKey={record => record.id}
                    scroll={{ x: 1800 }}
                    pagination={subPagination}
                    onChange={this.handleSubTableChange}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </Spin>
    );
  }
}

ProdReportsList.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseToLocale: PropTypes.func,
};

export default withForm({}, ProdReportsList);
