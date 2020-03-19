import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage, openModal, Icon, RestPagingTable, Tooltip } from 'src/components';
import { replaceSign } from 'src/constants';
import { PRIORITY } from 'src/containers/exceptionalEvent/constant';
import { primary } from 'src/styles/color';
import DeleteType from 'src/containers/exceptionalEvent/typeDefinition/delete';

import EditType from './edit';

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
        title: '类型名称',
        dataIndex: 'name',
        render: data => {
          return <Tooltip closeIntl text={data} length={20} />;
        },
      },
      {
        title: '默认重要类型',
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
        title: '默认逾期时间',
        dataIndex: 'overdueTimeout',
        render: data => {
          if (typeof data !== 'number' || data < 0) return replaceSign;

          if (data === 0) return changeChineseToLocale('不逾期');

          return `${data} ${changeChineseToLocale('分钟')}`;
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
                    children: <EditType typeId={id} fetchData={fetchData} />,
                    footer: null,
                    title: '编辑异常类型',
                    width: 680,
                  });
                }}
                defaultMessage={'编辑'}
              />
              <DeleteType data={record} typeId={id} fetchData={fetchData} />
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { style, data, totalAmount, fetchData } = this.props;

    const columns = this.getColumns();

    return (
      <RestPagingTable
        style={{ margin: 0, ...style }}
        dataSource={data || []}
        columns={columns}
        total={totalAmount || 0}
        refetch={fetchData}
      />
    );
  }
}

Table.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default Table;
