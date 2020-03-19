import React from 'react';
import { Table } from 'components';
import { getReceiveMaterialRecords } from 'services/shipment/receiptTask';
import { getSendMaterialRecords } from 'services/shipment/sendTask';
import { format } from 'utils/time';

class ReceiptTaskHistory extends React.PureComponent<any> {
  state = {
    dataSource: [],
    total: 0,
  };

  componentDidMount() {
    this.setInitialValue();
  }

  getColumns = () => {
    return [
      {
        title: '操作变量',
        dataIndex: 'amountDiff',
        key: 'amountDiff',
        render: amountDiff => (
          <span>
            {amountDiff >= 0 && '+'}
            {amountDiff}
          </span>
        ),
      },
      { title: '操作后数量', dataIndex: 'amount', key: 'amount' },
      { title: '入厂位置', dataIndex: 'storageName', key: 'storageName' },
      { title: '操作人', dataIndex: 'operatorName', key: 'operatorName' },
      { title: '操作时间', dataIndex: 'createdAt', key: 'createdAt', render: time => format(time) },
    ];
  };

  setInitialValue = async _params => {
    const { match: { params } } = this.props;
    const fetch =
      this.props.match.params.type === 'receipt' ? getReceiveMaterialRecords : getSendMaterialRecords;
    const { data: { data, total } } = await fetch({
      size: 10,
      page: 1,
      ...params,
      ..._params,
    });
    this.setState({ dataSource: data, total });
  };

  render() {
    const { dataSource, total } = this.state;
    const {
      match: { params: { searchMaterialCode } },
      location: { query: { materialName, storageName } },
    } = this.props;
    return (
      <div>
        <div style={{ margin: 20 }}>
          <h3>
            {searchMaterialCode}|{materialName}
          </h3>
          <p>库位：{storageName}</p>
        </div>
        <Table
          columns={this.getColumns()}
          dataSource={dataSource}
          pagination={{
            total,
            onChange: page => this.setInitialValue({ page }),
          }}
        />
      </div>
    );
  }
}

export default ReceiptTaskHistory;
