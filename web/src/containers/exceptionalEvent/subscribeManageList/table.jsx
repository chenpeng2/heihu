import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage, openModal, RestPagingTable } from 'src/components';
import { replaceSign } from 'src/constants';
import { primary } from 'src/styles/color';
import Item from 'src/containers/exceptionalEvent/subscribeManageList/item';

import Edit from './edit';
import Delete from './delete';

type Props = {
  style: {},
  data: [],
  totalAmount: number,
  fetchData: () => {},
};

class Table extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    const { fetchData } = this.props;
    const { changeChineseToLocale } = this.context;

    return [
      {
        title: '用户／用户组',
        dataIndex: 'userName',
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '报告等级',
        dataIndex: 'sendLevel',
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '订阅等级',
        dataIndex: 'subscribeLevel',
        render: data => {
          if (typeof data === 'number' && data === 0) return changeChineseToLocale('不订阅');
          return data || replaceSign;
        },
      },
      {
        title: '订阅事件类型',
        width: 300,
        dataIndex: 'subscribeCategory',
        render: data => {
          if (!Array.isArray(data)) return replaceSign;
          if (Array.isArray(data) && !data.length) return changeChineseToLocale('全部类型');

          return data.map(({ name }) => {
            return <Item text={name} />;
          });
        },
      },
      {
        title: '订阅设施范围',
        dataIndex: 'subscribeScope',
        width: 300,
        render: data => {
          if (!Array.isArray(data)) return replaceSign;
          if (Array.isArray(data) && !data.length) return changeChineseToLocale('全企业级');

          return data.map(({ facilityName }) => {
            return <Item text={facilityName} />;
          });
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
                    title: '编辑订阅配置',
                    width: 680,
                  });
                }}
                defaultMessage={'编辑'}
              />
              <Delete id={id} fetchData={fetchData} />
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { data, fetchData, totalAmount } = this.props;
    const columns = this.getColumns();

    return (
      <RestPagingTable
        total={totalAmount}
        style={{ margin: 0 }}
        columns={columns}
        dataSource={data || []}
        refetch={fetchData}
      />
    );
  }
}

Table.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default Table;
