import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';

import { setLocation } from 'utils/url';
import { exportXlsxFile } from 'utils/exportFile';
import { getQuery } from 'src/routes/getRouteParams';
import { RestPagingTable, Link, withForm, Badge, Tooltip } from 'components';
import moment, { formatUnix, formatDateTime } from 'utils/time';
import { arrayIsEmpty } from 'utils/array';
import { queryWeighingTaskList, queryWeighingRecordBulk } from 'src/services/weighing/weighingTask';
import { replaceSign } from 'src/constants';
import { border } from 'styles/color';

import { WEIGHING_TASK_STATUS, TASK_STATUS_COLOR, WEIGHING_TYPE, weighingModeMap } from '../constants';
import WeighingTaskFilter from './base/filterForList';
import WeighingTaskActions from './base/actionForList';
import { toWeighingTaskLog } from '../navigation';

type Props = {
  match: any,
  form: any,
};

class WeighingTaskList extends Component {
  props: Props;
  state = {
    total: 0,
    loading: false,
    bulkExport: false,
    allSelected: false,
    dataSource: [],
    selectedRows: [],
    selectedRowKeys: [],
  };

  componentDidMount = () => {
    const { match } = this.props;
    const lastQuery = getQuery(match);
    this.props.form.setFieldsValue(lastQuery);
  };

  getColumns = () => {
    return [
      {
        title: '任务号',
        key: 'code',
        dataIndex: 'code',
      },
      {
        title: '称量工位',
        key: 'workstations',
        dataIndex: 'workstations',
        render: workstations => {
          if (arrayIsEmpty(workstations)) return replaceSign;
          const workstationNames = workstations.map(({ name }) => name).join(',');
          return <Tooltip text={workstationNames} length={15} />;
        },
      },
      {
        title: '项目',
        key: 'projectCodes',
        dataIndex: 'projectCodes',
        render: codes => (!Array.isArray(codes) ? replaceSign : _.join(codes, '，')),
      },
      {
        title: '执行人',
        key: 'executorName',
        dataIndex: 'executorName',
        render: name => name || replaceSign,
      },
      {
        title: '计划开始时间',
        key: 'planBeginTime',
        dataIndex: 'planBeginTime',
        render: time => (time ? formatDateTime(time) : replaceSign),
      },
      {
        title: '计划结束时间',
        key: 'planEndTime',
        dataIndex: 'planEndTime',
        render: time => (time ? formatDateTime(time) : replaceSign),
      },
      {
        title: '任务状态',
        key: 'status',
        dataIndex: 'status',
        render: status => {
          const color = TASK_STATUS_COLOR[status] || border;
          return typeof status === 'number' ? (
            <Badge.MyBadge text={WEIGHING_TASK_STATUS[status]} color={color} />
          ) : (
            replaceSign
          );
        },
      },
      {
        title: '操作',
        key: 'operation',
        dataIndex: 'operation',
        render: (_, record) => {
          const { id } = record;

          return (
            <div>
              <Link to={`/weighingManagement/weighingTask/detail/${id}`}>详情</Link>
              <Link style={{ marginLeft: 10 }} to={toWeighingTaskLog({ id })}>
                日志
              </Link>
            </div>
          );
        },
      },
    ];
  };

  formatData = values => {
    const { productCode } = values;

    values.productCode = productCode ? productCode.key : null;

    return values;
  };

  fetchData = async params => {
    this.setState({ loading: true });
    const { match } = this.props;
    const query = getQuery(match);
    setLocation(this.props, { ...query, ...params });
    const _params = this.formatData({ ...query, ...params });
    try {
      const {
        data: { data, count },
      } = await queryWeighingTaskList(_params);
      this.setState({ loading: false });
      return { data, count };
    } catch (error) {
      console.log(error);
    }
  };

  fetchAndSetDataSource = async params => {
    const { data, count } = await this.fetchData(params);
    this.setState({ dataSource: data, total: count });
  };

  onBulkExportChange = () => {
    this.setState({
      bulkExport: !this.state.bulkExport,
      allSelected: false,
      selectedRowKeys: [],
      selectedRows: [],
    });
  };

  onSelectChange = ({ selectedRowKeys, selectedRows, allSelected }) => {
    const { selectedRows: allSelectedRows, dataSource } = this.state;
    // 在已选的数据里过滤当前页的数据，再加上这次当前页所选的数据
    const _selectedRows = _.differenceBy(allSelectedRows, dataSource, 'id').concat(selectedRows);

    this.setState({ selectedRowKeys, selectedRows: _selectedRows, allSelected });
  };

  fetchWeighingRecords = async params => {
    await queryWeighingRecordBulk(params)
      .then(res => {
        const data = _.get(res, 'data.data');
        this.setState({ weighingRecords: data });
        console.log(data);
      })
      .catch(err => console.log(err));
  };

  formatExportData = (data, titles) => {
    let rows = [];
    if (Array.isArray(data) && data.length > 0) {
      rows = data.map(e => {
        return titles
          .map(title => {
            let value = replaceSign;
            switch (title) {
              case 'materialCodeAndName':
                value = `${e.materialCode}/${e.materialName}`;
                break;
              case 'realWeight':
                value = `${e[title]} ${e.materialUnit || replaceSign}`;
                break;
              case 'weighingType':
                value = WEIGHING_TYPE[e[title]];
                break;
              case 'weighingMode': {
                const mode = typeof e[title] === 'number' ? e[title] : 1;
                value = weighingModeMap[mode];
                break;
              }
              case 'deadline':
                value = e[title] ? formatUnix(e[title]) : replaceSign;
                break;
              case 'createdAt':
                value = e[title] ? formatUnix(e[title]) : replaceSign;
                break;
              case 'sourceMaterial': {
                const source = _.last(e.fromSource);
                value = _.get(source, 'electronicTag', replaceSign);
                break;
              }
              default:
                value = e[title];
                break;
            }
            return value;
          })
          .map(e => e || replaceSign);
      });
    }
    return rows;
  };

  exportData = async () => {
    const { allSelected, selectedRowKeys, total } = this.state;
    let ids = selectedRowKeys;
    const headers = {
      任务号: 'taskCode',
      电子标签: 'electronicTag',
      '物料编号|物料名称': 'materialCodeAndName',
      流水号: 'serialNumber',
      项目: 'projectCode',
      工位: 'workstationName',
      称量器: 'weigher',
      来源物料: 'sourceMaterial',
      实重: 'realWeight',
      称量方法: 'weighingType',
      称量规则: 'weighingMode',
      有效期: 'deadline',
      称量时间: 'createdAt',
      操作人: 'executorName',
      核验人: 'verifierName',
    };
    if (allSelected) {
      const { data } = await this.fetchData({ size: total, page: 1 });
      ids = Array.isArray(data) && data.length > 0 ? data.map(({ id }) => id) : [];
      console.log(data);
    }
    await this.fetchWeighingRecords({ ids });
    const exportData = this.formatExportData(this.state.weighingRecords, Object.values(headers));
    exportXlsxFile([Object.keys(headers), ...exportData], `称量记录导出文件${moment().format('YYYYMMDDHHmmss')}`);
  };

  render() {
    const { dataSource, loading, total, bulkExport, selectedRowKeys, selectedRows, allSelected } = this.state;
    const { form } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => this.onSelectChange({ selectedRowKeys, selectedRows }),
      getCheckboxProps: record => ({
        disabled: allSelected,
      }),
    };

    return (
      <div>
        <WeighingTaskFilter fetchData={this.fetchAndSetDataSource} form={form} />
        <WeighingTaskActions
          tableParams={{ selectedRowKeys, allSelected, total }}
          bulkExport={bulkExport}
          onBulkExportChange={this.onBulkExportChange}
          onSelectChange={this.onSelectChange}
          exportData={this.exportData}
        />
        <RestPagingTable
          rowKey={record => record.id}
          columns={this.getColumns()}
          rowSelection={bulkExport ? rowSelection : null}
          refetch={this.fetchAndSetDataSource}
          dataSource={dataSource}
          loading={loading}
          total={total}
        />
      </div>
    );
  }
}

export default withForm({}, withRouter(WeighingTaskList));
