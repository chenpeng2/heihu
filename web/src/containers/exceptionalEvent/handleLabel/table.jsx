import React, { Component } from 'react';

import { RestPagingTable, openModal, FormattedMessage } from 'src/components';
import { replaceSign } from 'src/constants';
import { primary } from 'src/styles/color';

import Edit from './edit';
import Delete from './delete';

type Props = {
  data: [],
  totalAmount: number,
  fetchData: () => {},
};

class Table extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    const { fetchData } = this.props;

    return [
      {
        title: '标签名称',
        dataIndex: 'name',
        render: data => {
          return data || replaceSign;
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
                    children: <Edit labelId={id} fetchData={fetchData} />,
                    footer: null,
                    title: '编辑处理标签',
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

export default Table;
