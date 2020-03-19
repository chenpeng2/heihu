import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage, Checkbox, Icon, RestPagingTable, openModal, Tooltip } from 'src/components';
import { PRIORITY } from 'src/containers/exceptionalEvent/constant';
import { replaceSign } from 'src/constants';
import { primary } from 'src/styles/color';

import Edit from './edit';
import Delete from './delete';

type Props = {
  data: [],
  totalAmount: number,
  fetchData: () => {},
  changeStatus: () => {},
};

class Table extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    const { fetchData } = this.props;
    const { changeChineseToLocale } = this.context;

    return [
      {
        title: '事件主题',
        dataIndex: 'name',
        render: data => {
          const text = data || replaceSign;
          return <Tooltip text={text} length={20} />;
        },
      },
      {
        title: '事件类型',
        dataIndex: 'eventCategory',
        key: 'typeName',
        render: data => {
          const { name } = data || {};

          return <Tooltip text={name || replaceSign} length={20} />;
        },
      },
      {
        title: '重要性',
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
        title: '逾期时间',
        dataIndex: 'overdueTimeout',
        render: data => {
          if (typeof data !== 'number' || data < 0) return replaceSign;

          if (data === 0) return changeChineseToLocale('不逾期');

          return `${data} ${changeChineseToLocale('分钟')}`;
        },
      },
      {
        title: '启用',
        dataIndex: 'status',
        render: (data, record) => {
          const { changeStatus } = this.props;
          const { id } = record || {};

          return (
            <Checkbox
              checked={data === 1}
              onChange={e => {
                const status = e.target.checked ? 1 : 0;
                changeStatus(id, status);
              }}
            />
          );
        },
      },
      {
        title: '操作',
        key: 'operation',
        render: (_, record) => {
          const { id } = record;
          const textStyle = { color: primary, cursor: 'pointer', marginRight: 10 };

          return (
            <div>
              <FormattedMessage
                style={textStyle}
                onClick={() => {
                  openModal({
                    children: <Edit id={id} fetchData={fetchData} />,
                    footer: null,
                    title: '编辑处理标签',
                    width: 680,
                  });
                }}
                defaultMessage={'编辑'}
              />
              <Delete id={id} data={record} fetchData={fetchData} />
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { data, totalAmount, fetchData } = this.props;
    const columns = this.getColumns();

    return (
      <div>
        <RestPagingTable
          style={{ margin: 0 }}
          dataSource={data || []}
          total={totalAmount || 0}
          refetch={fetchData}
          columns={columns}
        />
      </div>
    );
  }
}

Table.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default Table;
