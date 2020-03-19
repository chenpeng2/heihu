import React, { Component } from 'react';
import _ from 'lodash';
import { Row, Col, RestPagingTable, Tooltip } from 'components';
import { queryPurchaseOrderImportDetail } from 'src/services/cooperate/purchaseOrder';
import { thousandBitSeparator } from 'utils/number';
import { formatDate, formatUnix } from 'utils/time';
import { replaceSign } from 'src/constants';

type Props = {
  viewer: any,
  relay: any,
  match: any,
};

class PlannedTicketImportDetail extends Component {
  props: Props;
  state = {
    loading: false,
    data: {},
    pagination: {},
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async params => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    this.setState({ loading: true });
    const {
      data: { data },
    } = await queryPurchaseOrderImportDetail(id);
    this.setState({
      data,
      loading: false,
      pagination: {
        total: _.get(data, 'detail.length'),
        pageSize: 10,
        current: 1,
      },
    });
  };

  getColumns = () => {
    const columns = [
      {
        title: '失败原因',
        dataIndex: 'reason',
        width: 200,
        render: text => (text ? <Tooltip text={text} length={25} /> : replaceSign),
      },
      {
        title: '订单编号',
        width: 120,
        dataIndex: 'purchaseOrderCode',
        render: text => (text ? <Tooltip text={text} length={15} /> : replaceSign),
      },
      {
        title: '客户名称',
        width: 120,
        dataIndex: 'customerName',
        render: text => (text ? <Tooltip text={decodeURIComponent(text)} length={15} /> : replaceSign),
      },
      {
        title: '备注',
        width: 120,
        dataIndex: 'remark',
        render: text => (text ? <Tooltip text={text} length={20} /> : replaceSign),
      },
      {
        title: '物料编号',
        dataIndex: 'materialCode',
        width: 120,
        render: text => (text ? <Tooltip text={text} length={20} /> : replaceSign),
      },
      {
        title: '数量',
        dataIndex: 'materialAmount',
        width: 120,
        render: text => (text >= 0 ? thousandBitSeparator(text) : replaceSign),
      },
      {
        title: '单位',
        dataIndex: 'unitName',
        width: 120,
        render: text => (text ? <Tooltip text={text} length={15} /> : replaceSign),
      },
      {
        title: '交货日期',
        dataIndex: 'materialTargetDate',
        width: 120,
        render: text => (text ? <Tooltip text={text} length={15} /> : replaceSign),
      },
    ];
    return columns;
  };

  render() {
    const colums = this.getColumns();
    const { changeChineseToLocale, changeChineseTemplateToLocale } = this.context;
    const { data, loading, pagination, count } = this.state;
    const { createdAt, userName, status, successAmount, failureAmount } = data;
    const total = count || 1;

    return (
      <div>
        <p style={{ fontSize: 16, margin: 20 }}>{changeChineseToLocale('导入日志详情')}</p>
        <div style={{ marginBottom: 30 }}>
          <Row>
            <Col type="title" style={{ paddingLeft: 20 }}>
              导入时间
            </Col>
            <Col type="content" style={{ width: 920 }}>
              {createdAt ? formatUnix(data.createdAt) : replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type="title" style={{ paddingLeft: 20 }}>
              导入用户
            </Col>
            <Col type="content" style={{ width: 920 }}>
              {userName ? decodeURIComponent(userName) : replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type="title" style={{ paddingLeft: 20 }}>
              导入结果
            </Col>
            <Col type="content" style={{ width: 920 }}>
              {status}
            </Col>
          </Row>
          <Row>
            <Col type="title" style={{ paddingLeft: 20 }}>
              导入详情
            </Col>
            <Col type="content" style={{ width: 920 }}>
              {changeChineseTemplateToLocale('销售订单导入完成！成功数：{successAmount}，失败数：{failureAmount}。', {
                successAmount,
                failureAmount,
              })}
            </Col>
          </Row>
        </div>
        <RestPagingTable
          dataSource={_.get(data, 'detail', [])}
          rowKey={record => record.id}
          columns={colums}
          loading={loading}
          pagination={pagination}
          total={total}
          onChange={pagination => {
            this.setState({
              pagination: {
                current: pagination.current,
                pageSize: 10,
              },
            });
          }}
          bordered
        />
      </div>
    );
  }
}

PlannedTicketImportDetail.contextTypes = {
  changeChineseToLocale: () => {},
  changeChineseTemplateToLocale: () => {},
};

export default PlannedTicketImportDetail;
