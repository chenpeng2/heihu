import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, RestPagingTable, Tooltip } from 'components';
import { getImportDetail, getImportErrorList } from 'services/shipment/sendTask';
import { formatUnix } from 'utils/time';
import { getQuery } from 'src/routes/getRouteParams';
import { replaceSign } from 'src/constants';

type Props = {
  match: {
    params: {
      id: string,
    },
  },
};

class ImportDetail extends Component {
  props: Props;
  state = {
    loading: false,
    data: null,
    detailList: null,
    importId: '',
    total: 1,
  };

  componentDidMount() {
    const { match } = this.props;
    const { id } = match.params;
    this.setState(
      {
        importId: id,
        pagination: {
          current: 1,
        },
      },
      () => {
        const { match } = this.props;
        const query = getQuery(match);
        const variables = { ...query };
        this.fetchData({ ...variables });
      },
    );
  }

  fetchData = async params => {
    const { importId } = this.state;
    this.setState({ loading: true });
    const res = await getImportDetail(importId);
    const res1 = await getImportErrorList(importId, params);
    const { data } = res.data;
    const { data: detailList } = res1.data;
    this.setState({
      data: {
        createdAt: formatUnix(data.createdAt),
        successAmount: data.successAmount,
        failureAmount: data.failureAmount,
        operatorName: data.operatorName,
        status: (() => {
          const status = data.status;
          if (status === 0) {
            return '导入失败';
          } else if (status === 1) {
            return '导入成功';
          }
          return '部分导入成功';
        })(),
      },
      detailList,
      loading: false,
      total: res1.data.total,
    });
  };

  getColumns = () => {
    const columns = [
      {
        title: '交货单号',
        dataIndex: 'content.zhuiyingDTO.deliveryOddNumber',
      },
      {
        title: '失败原因',
        dataIndex: 'errorDetail',
      },
    ];
    return columns;
  };

  render() {
    const { data, detailList, loading } = this.state;
    if (!data || !detailList) return null;
    const columns = this.getColumns();
    const total = this.state.total || 1;

    return (
      <div>
        <div style={{ margin: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 15 }}>导入日志详情</p>
          <div style={{ marginBottom: 30 }}>
            <Row>
              <Col type={'title'} style={{ paddingLeft: 20 }}>
                {'导入时间'}
              </Col>
              <Col type={'content'} style={{ width: 920 }}>
                {data.createdAt}
              </Col>
            </Row>
            <Row>
              <Col type={'title'} style={{ paddingLeft: 20 }}>
                {'导入用户'}
              </Col>
              <Col type={'content'} style={{ width: 920 }}>
                {data.operatorName}
              </Col>
            </Row>
            <Row>
              <Col type={'title'} style={{ paddingLeft: 20 }}>
                {'导入结果'}
              </Col>
              <Col type={'content'} style={{ width: 920 }}>
                {data.status}
              </Col>
            </Row>
            <Row>
              <Col type={'title'} style={{ paddingLeft: 20 }}>
                {'导入详情'}
              </Col>
              <Col type={'content'} style={{ width: 920 }}>{`导入完成，发运任务导入成功数：${
                data.successAmount
              }，发运任务导入失败数：${data.failureAmount}`}</Col>
            </Row>
          </div>
        </div>
        <RestPagingTable
          dataSource={detailList}
          refetch={this.fetchData}
          total={total}
          rowKey={record => record.id}
          columns={columns}
          loading={loading}
          scroll={{ x: 1500 }}
          bordered
        />
      </div>
    );
  }
}

export default ImportDetail;
