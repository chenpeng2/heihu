import React, { Component } from 'react';
import { Row, Col, Table, Tooltip, Spin, FormattedMessage } from 'components';
import { getMbomImportLogDetail } from 'src/services/bom/mbom';
import { formatDate, formatUnix } from 'utils/time';
import { replaceSign } from 'src/constants';
import { getLocation } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import color from 'styles/color';

type Props = {
  viewer: any,
  relay: any,
  match: any,
};

const statusDisplay = {
  SUCCESS: { color: color.primary, display: '导入成功' },
  FAILURE: { color: color.error, display: '导入失败' },
  PART_SUCCESS: { color: color.khaki, display: '部分导入成功' },
};

class MbomImportLogDetail extends Component {
  props: Props;
  state = {
    loading: false,
    data: {},
    total: 0,
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
      match,
    } = this.props;
    this.setState({ loading: true });
    const {
      data: { data, count },
    } = await getMbomImportLogDetail(id);
    const { details, title } = data || {};
    const location = getLocation(match);
    location.query = { ...location.query, ...params };
    setLocation(this.props, () => location.query);
    this.setState({
      data: title,
      details,
      loading: false,
      total: count,
    });
  };

  formatData = details => {
    let format;
    details.forEach(({ processInfo, ...rest }) => {
      processInfo.forEach(({ inputInfo, outputInfo }) => {
        format = inputInfo.map((x, index) => ({ ...x, ...outputInfo[index], ...rest }));
      });
    });
    return format;
  };

  getColumns = () => {
    const columns = [
      {
        title: '失败原因',
        dataIndex: 'reason',
        width: 500,
        render: text => (text ? <Tooltip text={text} length={40} /> : replaceSign),
      },
      {
        title: '成品物料编号',
        dataIndex: 'materialCode',
        width: 120,
        render: text => (text ? <Tooltip text={text} length={15} /> : replaceSign),
      },
      {
        title: '成品物料数量',
        width: 120,
        dataIndex: 'defNum',
        render: (text, record) => (text ? `${text} ${record.defUnit}` : replaceSign),
      },
      {
        title: '版本号',
        dataIndex: 'version',
        width: 150,
        render: text => text || replaceSign,
      },
      {
        title: '有效期开始',
        dataIndex: 'validFrom',
        width: 120,
        render: text => (text ? (formatDate(text) === 'invalid date' ? text : formatDate(text)) : replaceSign),
      },
      {
        title: '有效期结束',
        dataIndex: 'validTo',
        width: 120,
        render: text => (text ? (formatDate(text) === 'invalid date' ? text : formatDate(text)) : replaceSign),
      },
      {
        title: '工艺路线编号',
        width: 120,
        dataIndex: 'processRoutingCode',
        render: text => (text ? <Tooltip text={text} length={15} /> : replaceSign),
      },
      {
        title: '物料清单版本号',
        width: 150,
        dataIndex: 'ebomVersion',
        render: text => text || replaceSign,
      },
      {
        title: '组件分配',
        dataIndex: 'bindEBomToProcessRouting',
        width: 120,
        render: text => text || replaceSign,
      },
    ];
    return columns;
  };

  render() {
    const columns = this.getColumns();
    const { data, details, loading, total } = this.state;
    const { createdAt, userName, status, successAmount, failureAmount } = data;

    return (
      <Spin spinning={loading}>
        <p style={{ fontSize: 16, margin: 20 }}>
          <FormattedMessage defaultMessage={'导入日志详情'} />
        </p>
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
              {statusDisplay[status] ? statusDisplay[status].display : '导入失败'}
            </Col>
          </Row>
          <Row>
            <Col type="title" style={{ paddingLeft: 20 }}>
              导入详情
            </Col>
            <Col type="content" style={{ width: 920 }}>
              <FormattedMessage
                defaultMessage={'生产BOM导入完成！成功数：{successAmount}，失败数：{failureAmount}。'}
                values={{
                  failureAmount,
                  successAmount,
                }}
              />
            </Col>
          </Row>
        </div>
        <Table
          dataSource={details}
          rowKey={record => record.id}
          columns={columns}
          total={total}
          scroll={{ x: 1600 }}
          // refetch={this.fetchData}
          bordered
        />
      </Spin>
    );
  }
}

export default MbomImportLogDetail;
