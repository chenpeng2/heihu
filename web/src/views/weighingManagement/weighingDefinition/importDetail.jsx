import React, { Component } from 'react';
import { Spin, Row, Col, RestPagingTable, Tooltip } from 'components';
import { queryWeighingDefinitionImportDetail } from 'services/weighing/weighingDefinition';
import { thousandBitSeparator } from 'utils/number';
import { formatUnix } from 'utils/time';
import { replaceSign } from 'src/constants';

type Props = {
  viewer: any,
  relay: any,
  match: any,
};

class WeighingDefinitionImportDetail extends Component {
  props: Props;
  state = {
    loading: false,
    data: {},
    details: [],
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
    } = await queryWeighingDefinitionImportDetail(id);
    const { details, importDTO } = data || {};
    this.setState({
      data: importDTO,
      details,
      loading: false,
    });
  };

  getColumns = () => {
    const columns = [
      {
        title: '失败原因',
        dataIndex: 'reason',
        width: 200,
        render: text => (text ? <Tooltip text={text} length={30} /> : replaceSign),
      },
      {
        title: '成品物料',
        width: 200,
        dataIndex: 'productCode',
        render: text => (text ? <Tooltip text={text} length={30} /> : replaceSign),
      },
      {
        title: '称量工位',
        width: 120,
        dataIndex: 'workstationCode',
        render: text => (text ? <Tooltip text={text} length={15} /> : replaceSign),
      },
      {
        title: '物料清单',
        dataIndex: 'ebomVersion',
        width: 120,
        render: text => (text ? <Tooltip text={text} length={15} /> : replaceSign),
      },
      {
        title: '物料编号',
        dataIndex: 'materialCode',
        width: 200,
        render: text => (text ? <Tooltip text={text} length={30} /> : replaceSign),
      },
    ];
    return columns;
  };

  render() {
    const { data, details, loading } = this.state;
    const { createdAt, userName, status, successAmount = 0, failureAmount = 0 } = data;
    const colums = this.getColumns();

    return (
      <Spin spinning={loading}>
        <p style={{ fontSize: 16, margin: 20 }}>导入日志详情</p>
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
              {userName || replaceSign}
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
            <Col type="content" style={{ width: 920 }}>{`称量定义导入完成！成功数：${thousandBitSeparator(
              successAmount,
            )}，失败数：${thousandBitSeparator(failureAmount)}。`}</Col>
          </Row>
        </div>
        <RestPagingTable
          dataSource={details}
          rowKey={record => record.id}
          columns={colums}
          loading={loading}
          bordered
        />
      </Spin>
    );
  }
}

export default WeighingDefinitionImportDetail;
