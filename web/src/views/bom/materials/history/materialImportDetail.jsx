import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col, RestPagingTable, Tooltip, FormattedMessage } from 'src/components';
import { queryMaterialImportDetail } from 'src/services/bom/material';
import { formatUnix } from 'src/utils/time';
import { getQuery } from 'src/routes/getRouteParams';
import { replaceSign } from 'src/constants';

import styles from './styles.scss';

type Props = {
  viewer: any,
  relay: any,
  match: any,
  params: {
    materialId: string,
  },
};

class MaterialImportDetail extends Component {
  props: Props;
  state = {
    loading: false,
    data: {},
    detailList: [],
    importId: '',
    pagination: {},
  };

  getColumns = () => {
    const columns = [
      {
        title: '失败原因',
        dataIndex: 'reason',
        render: text => <Tooltip text={text || replaceSign} length={18} />,
      },
      {
        title: '编号',
        dataIndex: 'code',
        render: text => <Tooltip text={text || replaceSign} length={20} />,
      },
      {
        title: '名称',
        dataIndex: 'name',
        render: text => <Tooltip text={text || replaceSign} length={30} />,
      },
      {
        title: '单位',
        dataIndex: 'unitName',
        render: text => <Tooltip text={text || replaceSign} length={12} />,
      },
      {
        title: '规格描述',
        dataIndex: 'desc',
        type: 'importDetailType',
        key: 'desc',
        render: text => <Tooltip text={text || replaceSign} length={20} />,
      },
    ];
    return columns;
  };

  componentDidMount() {
    const { match } = this.props;
    const { importId } = match.params;
    this.setState(
      {
        importId,
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
    params = { importId, ...params };
    this.setState({ loading: true });
    const res = await queryMaterialImportDetail(params);
    const { data } = res.data;
    const { detailList } = data;
    this.setState({
      data: {
        createdAt: formatUnix(data.createdAt),
        content: data.content,
        userName: data.userName,
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
      pagination: {
        total: res.data.count,
        current: res.data.page,
      },
    });
  };

  render() {
    const { data, detailList, loading } = this.state;
    const total = this.state.count || 1;
    const { createdAt, userName, status, content } = data || {};

    return (
      <div id="materialImport_detail">
        <FormattedMessage className={styles.detailLogHeader} defaultMessage={'导入日志详情'} />
        <div style={{ marginBottom: 30 }}>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {'导入时间'}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {createdAt || replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {'导入用户'}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {userName || replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {'导入结果'}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {status || replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {'导入详情'}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {content || replaceSign}
            </Col>
          </Row>
        </div>
        <RestPagingTable
          dataSource={detailList}
          refetch={this.fetchData}
          total={total}
          rowKey={record => record.id}
          columns={this.getColumns()}
          loading={loading}
          pagination={this.state.pagination}
          bordered
        />
      </div>
    );
  }
}

MaterialImportDetail.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default MaterialImportDetail;
