import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Table, Tooltip } from 'components';
import {
  querySparePartsImportDetail,
  querySparePartsImportErrorList,
} from 'src/services/equipmentMaintenance/spareParts';
import { formatUnix } from 'utils/time';
import { getQuery } from 'src/routes/getRouteParams';
import { replaceSign } from 'src/constants';
import styles from './styles.scss';

type Props = {
  match: any,
  params: {
    id: string,
  },
};

class SparePartsImportDetail extends Component {
  props: Props;
  state = {
    loading: false,
    data: null,
    detailList: null,
    importId: '',
  };

  componentDidMount() {
    const { match } = this.props;
    const { id } = match.params;
    this.setState(
      {
        importId: id,
      },
      () => {
        const { match } = this.props;
        const query = getQuery(match);
        const variables = { ...query };
        this.fetchData({ ...variables });
      },
    );
  }

  getColumns = () => {
    const columns = [
      {
        title: '失败原因',
        dataIndex: 'errorDetail',
        render: errorDetail => <Tooltip text={errorDetail || replaceSign} length={18} />,
      },
      {
        title: '编号',
        dataIndex: 'content',
        key: 'code',
        render: content => <Tooltip text={content.code || replaceSign} length={20} />,
      },
      {
        title: '名称',
        dataIndex: 'content',
        key: 'name',
        render: content => <Tooltip text={content.name || replaceSign} length={30} />,
      },
      {
        title: '单位',
        dataIndex: 'content',
        key: 'unit',
        render: content => <Tooltip text={content.unit || replaceSign} length={12} />,
      },
      {
        title: '规格描述',
        dataIndex: 'content',
        key: 'desc',
        type: 'importDetailType',
        render: content => <Tooltip text={content.desc || replaceSign} length={20} />,
      },
    ];
    return columns;
  };

  fetchData = async params => {
    const { importId } = this.state;
    this.setState({ loading: true });
    const res = await querySparePartsImportDetail(importId);
    const res1 = await querySparePartsImportErrorList({ importId, ...params });
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
    });
  };

  render() {
    const { data, detailList, loading } = this.state;
    if (!data || !detailList) return null;
    const columns = this.getColumns();
    const total = this.state.count || 1;

    return (
      <div id="materialImport_detail">
        <p className={styles.detailLogHeader}>导入日志详情</p>
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
            <Col type={'content'} style={{ width: 920 }}>{`导入完成，备件导入成功数：${
              data.successAmount
            }，备件导入失败数：${data.failureAmount}`}</Col>
          </Row>
        </div>
        <Table
          dataSource={detailList}
          refetch={this.fetchData}
          total={total}
          rowKey={record => record.id}
          columns={columns}
          loading={loading}
          bordered
        />
      </div>
    );
  }
}

SparePartsImportDetail.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default SparePartsImportDetail;
