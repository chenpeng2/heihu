import React, { Component } from 'react';

import { RestPagingTable, Tooltip, Badge } from 'src/components';
import { primary, error } from 'src/styles/color';
import { replaceSign } from 'src/constants';
import ChangeUseStatus from 'src/containers/workingCalendar/base/changeUseStatus';
import LinkToWorkingCalendarDetail from 'src/containers/workingCalendar/base/linkToWorkingCalendarDetail';
import LinkToEditWorkingCalendar from 'src/containers/workingCalendar/base/linkEditWorkingCalendarPage';
import { WORKINGDAY, AVAILABLE_DATE_TYPE } from 'src/containers/workingCalendar/constant';

import { getAvailableDateValue, getTimeRange } from '../utils';


type Props = {
  data: [],
  totalAmount: number,
  fetchData: () => {},
  loading: boolean,
};

class Table extends Component {
  props: Props;
  state = {
    sortInfo: {},
  };

  getColumns = (sortInfo) => {
    const { fetchData } = this.props;

    return [
      {
        title: '适用工位',
        dataIndex: 'workstations',
        key: 'workstations',
        render: (data) => {
          if (!Array.isArray(data)) return replaceSign;

          const workstationNames = data.map(({ name }) => name).join(',');
          return <Tooltip text={workstationNames || replaceSign} length={10} />;
        },
      },
      {
        title: '适用日期',
        dataIndex: 'availableDateValue',
        key: 'availableDateValue',
        render: (data, record) => {
          if (!data) return replaceSign;

          const { availableDateType } = record || {};

          const value = getAvailableDateValue(data, availableDateType);

          return <Tooltip text={value} length={20} />;
        },
      },
      {
        title: '适用时间范围',
        key: 'timeRange',
        render: (_, record) => {
          const { startTime, endTime, availableDateType } = record;

          const text = getTimeRange(startTime, endTime, AVAILABLE_DATE_TYPE[availableDateType].type);

          return <Tooltip text={text || replaceSign} length={40} />;
        },
      },
      {
        title: '是否工作日',
        dataIndex: 'workingDay',
        key: 'workingDay',
        render: (data) => {
          if (typeof data !== 'number') return replaceSign;

          return WORKINGDAY[data] || replaceSign;
        },
      },
      {
        title: '工作时间',
        dataIndex: 'operatingHour',
        key: 'operatingHour',
        render: (data) => {
          if (!data) return replaceSign;
          const { name } = data || {};

          return <Tooltip text={name} length={10} />;
        },
      },
      {
        title: '优先级',
        dataIndex: 'priority',
        sorter: true,
        sortOrder: sortInfo.columnKey === 'priority' && sortInfo.order,
        key: 'priority',
        render: (data) => {
          if (typeof data !== 'number') return replaceSign;
          return data;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (data) => {
          if (!data) return replaceSign;

          const { name, code } = data || {};
          return <Badge.MyBadge text={name || replaceSign} color={code === 1 ? primary : error} />;
        },
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 200,
        render: (_, record) => {
          const { id, status } = record;

          return (
            <div>
              <LinkToWorkingCalendarDetail id={id} />
              <LinkToEditWorkingCalendar id={id} />
              <ChangeUseStatus code={id} statusNow={status} fetchData={fetchData} />
            </div>
          );
        },
      },
    ];
  };

  handleTableChange = (pagination, filters, sorter, variables) => {
    const { fetchData } = this.props;

    if (sorter && sorter.columnKey) {
      const { columnKey, order } = sorter;
      fetchData({ ...variables, sortBy: columnKey, order: order === 'ascend' ? 'ASC' : 'DESC' }, () => {
        this.setState({ sortInfo: sorter });
      });
    } else {
      fetchData({ ...variables });
    }
  }

  render() {
    const { fetchData, totalAmount, data, loading } = this.props;
    const { sortInfo } = this.state;

    const columns = this.getColumns(sortInfo);

    return (
      <div>
        <RestPagingTable
          loading={loading}
          columns={columns}
          dataSource={data || []}
          refetch={fetchData}
          total={totalAmount || 0}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

export default Table;
