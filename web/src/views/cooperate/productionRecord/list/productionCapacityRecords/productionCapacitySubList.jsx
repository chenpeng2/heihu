import React, { Component } from 'react';
import { RestPagingTable, Button, Icon, Spin } from 'components';

type Props = {
  loading: boolean,
};

class ProductionCapacitySubList extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    return [
      {
        title: '原因代码',
        dataIndex: 'amount',
        key: 'reasonCode',
        sorter: (a, b) => a.name.length - b.name.length,
        render: (amount, record) => amount,
      },
      {
        title: '损失类型',
        dataIndex: 'amount',
        key: 'lossCategory',
        sorter: (a, b) => a.name.length - b.name.length,
        render: (amount, record) => amount,
      },
      {
        title: '损失原因',
        dataIndex: 'amount',
        key: 'lossReason',
        render: (amount, record) => amount,
      },
      {
        title: `损失时间${'分钟'}`,
        dataIndex: 'amount',
        key: 'lossTime',
        render: (amount, record) => amount,
      },
    ];
  }

  render() {
    const { loading } = this.props;
    const columns = this.getColumns();

    return (
      <Spin spinning={false}>
        <div style={{ marginTop: 70, marginBottom: 200 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', marginBottom: 10 }}>
            <div style={{ lineHeight: '28px' }}>
              <Icon type="bars" />
              <span style={{ marginLeft: 3 }}>损失原因统计</span>
              <span style={{ marginLeft: 20 }}>工位：{'裁切机01'}</span>
              <span style={{ marginLeft: 20 }}>日期：{'2018/04/04~2018/04/05'}</span>
            </div>
            <Button
              icon="upload"
              // onClick={() => { this.dataExport(exportParams); }}
              // disabled={data && data.total === 0}
            >
              数据导出
            </Button>
          </div>
          <RestPagingTable
            bordered
            dataSource={[]}
            total={0}
            rowKey={record => record.id}
            columns={columns}
            // refetch={refetch}
          />
        </div>
      </Spin>
    );
  }
}

export default ProductionCapacitySubList;
