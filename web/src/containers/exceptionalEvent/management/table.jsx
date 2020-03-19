import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link, Badge, Icon, RestPagingTable, Tooltip } from 'src/components';
import { replaceSign } from 'src/constants';
import { error, primary, secondaryGrey } from 'src/styles/color';
import { findRelatedTask, PRIORITY, EVENT_STATUS, RELATED_TASK } from 'src/containers/exceptionalEvent/constant';
import Close from 'src/containers/exceptionalEvent/management/close';
import Delete from 'src/containers/exceptionalEvent/management/delete';
import moment from 'src/utils/time';
import { arrayIsEmpty } from 'src/utils/array';

import { getDetailUrl } from '../constant';

type Props = {
  style: {},
  fetchData: () => {},
  data: [],
  totalAmount: number,
};

class Table extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    const { fetchData } = this.props;
    const { changeChineseToLocale } = this.context;

    return [
      {
        title: '编号',
        width: 150,
        dataIndex: 'code',
        render: data => {
          return <Tooltip text={data} length={20} />;
        },
      },
      {
        title: '事件类型',
        width: 150,
        dataIndex: 'eventCategoryName',
        render: data => {
          return <Tooltip text={data} length={10} />;
        },
      },
      {
        title: '重要性',
        width: 150,
        dataIndex: 'priority',
        render: data => {
          const { display, iconType, iconColor } = PRIORITY[data] || {};

          if (!display) return replaceSign;

          return (
            <div>
              <Icon iconType={'gc'} type={iconType} style={{ color: iconColor }} />
              {changeChineseToLocale(display)}
            </div>
          );
        },
      },
      {
        title: '事件主题',
        width: 150,
        dataIndex: 'eventTopic',
        render: data => {
          const text = data || replaceSign;
          return <Tooltip text={text} length={10} />;
        },
      },
      {
        title: '设施位置',
        width: 150,
        dataIndex: 'sourceName',
        render: data => <Tooltip text={data || replaceSign} length={10} />,
      },
      {
        title: '事件等级',
        dataIndex: 'currentLevel',
        width: 150,
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '处理状态',
        width: 150,
        dataIndex: 'status',
        render: data => {
          if (typeof data !== 'number') return replaceSign;

          let color;
          if (data === 2) {
            color = secondaryGrey;
          }
          if (data === 0) {
            color = error;
          }
          if (data === 1) {
            color = primary;
          }

          return <Badge.MyBadge text={EVENT_STATUS[data]} color={color} />;
        },
      },
      {
        title: '处理标签',
        dataIndex: 'labelName',
        width: 150,
        render: data => {
          if (!data) return replaceSign;
          return <Tooltip text={data} length={10} />;
        },
      },
      {
        title: '处理人',
        dataIndex: 'handlerName',
        width: 150,
        render: data => {
          return <Tooltip text={data || replaceSign} length={10} />;
        },
      },
      {
        title: '报告人',
        dataIndex: 'reporterName',
        width: 150,
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '处理时长',
        dataIndex: 'processDuration',
        width: 150,
        render: data => <Tooltip text={typeof data === 'number' ? `${data} ${changeChineseToLocale('分钟')}` : replaceSign} length={10} />,
      },
      {
        title: '报告时间',
        dataIndex: 'createdAt',
        width: 150,
        render: data => {
          if (!data) return replaceSign;
          return moment(data).format('YYYY/MM/DD HH:mm');
        },
      },
      {
        title: '最近响应时间',
        dataIndex: 'lastRespondedAt',
        width: 150,
        render: data => {
          if (!data) return replaceSign;
          return moment(data).format('YYYY/MM/DD HH:mm');
        },
      },
      {
        title: '相关任务',
        dataIndex: 'relatedTask',
        width: 250,
        render: (__, record) => {
          const { sourceTaskCode, sourceTaskType } = record;
          const { name } = findRelatedTask(sourceTaskType) || {};
          const url = getDetailUrl(sourceTaskType, sourceTaskCode);

          if (name && url) return <Link to={url}>{`${changeChineseToLocale(name)} (${sourceTaskCode})`}</Link>;
          return replaceSign;
        },
      },
      {
        title: '操作',
        key: 'operation',
        width: 100,
        fixed: 'right',
        render: (_, record) => {
          const { status, code } = record;

          if (typeof status !== 'number') return replaceSign;
          if (status === 2) return <Delete id={code} fetchData={fetchData} />;
          return <Close id={code} fetchData={fetchData} />;
        },
      },
    ];
  };

  render() {
    const { style, data, totalAmount, fetchData, ...rest } = this.props;

    const columns = this.getColumns();

    return (
      <RestPagingTable
        style={style}
        dataSource={data || []}
        scroll={{ x: true }}
        columns={columns}
        total={totalAmount || 0}
        refetch={fetchData}
        {...rest}
      />
    );
  }
}

Table.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default Table;
