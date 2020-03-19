import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Row, Col, RestPagingTable, Tooltip } from 'src/components';
import { importLogDetail, importLogDetailReason } from 'src/services/stock/material';
import { formatUnix } from 'utils/time';
import { getQuery } from 'src/routes/getRouteParams';
import { replaceSign } from 'src/constants';
import { error } from 'src/styles/color';

type Props = {
  viewer: any,
  relay: any,
  match: any,
  params: {
    materialId: string,
  },
};

class qrCodeImportLogDetail extends Component {
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
        dataIndex: 'errorDetail',
        render: data => {
          return <Tooltip text={data ? data.msg : replaceSign} length={18} />;
        },
      },
      {
        title: '二维码',
        dataIndex: 'content.qrCode',
        render: (text, record) => {
          const { errorDetail } = record || {};
          if (errorDetail && errorDetail.item === 'qrCode') {
            return <Tooltip containerStyle={{ color: error }} text={text || replaceSign} length={12} />;
          }
          return <Tooltip text={text || replaceSign} length={12} />;
        },
      },
      {
        title: '物料编号',
        dataIndex: 'content.materialCode',
        render: (text, record) => {
          const { errorDetail } = record || {};
          if (errorDetail && errorDetail.item === 'materialCode') {
            return <Tooltip containerStyle={{ color: error }} text={text || replaceSign} length={20} />;
          }
          return <Tooltip text={text || replaceSign} length={20} />;
        },
      },
      {
        title: '数量',
        dataIndex: 'content.amount',
        render: (text, record) => {
          const { errorDetail } = record || {};
          if (errorDetail && errorDetail.item === 'amount') {
            return <Tooltip containerStyle={{ color: error }} text={text || replaceSign} length={12} />;
          }

          return <Tooltip text={text || replaceSign} length={12} />;
        },
      },
      {
        title: '单位',
        dataIndex: 'context.unitName',
        render: (text, record) => {
          const { errorDetail } = record || {};
          if (errorDetail && errorDetail.item === 'unitName') {
            return <Tooltip containerStyle={{ color: error }} text={text || replaceSign} length={12} />;
          }
          return <Tooltip text={text || replaceSign} length={12} />;
        },
      },
      {
        title: '质量状态',
        dataIndex: 'context.qcStatus',
        render: (text, record) => {
          const { errorDetail } = record || {};
          if (errorDetail && errorDetail.item === 'qcStatus') {
            return <Tooltip containerStyle={{ color: error }} text={text || replaceSign} length={12} />;
          }
          return <Tooltip text={text || replaceSign} length={12} />;
        },
      },
      {
        title: '二级仓位编码',
        width: 130,
        dataIndex: 'content.storageCode',
        render: (text, record) => {
          const { errorDetail } = record;
          if (errorDetail && errorDetail.item === 'storageCode') {
            return <Tooltip containerStyle={{ color: error }} text={text || replaceSign} length={20} />;
          }
          return <Tooltip text={text || replaceSign} length={20} />;
        },
      },
      {
        title: '供应商编码',
        dataIndex: 'content.supplierCode',
        render: (text, record) => {
          const { errorDetail } = record || {};
          if (errorDetail && errorDetail.item === 'supplierCode') {
            return <Tooltip containerStyle={{ color: error }} text={text || replaceSign} length={20} />;
          }
          return <Tooltip text={text || replaceSign} length={20} />;
        },
      },
      {
        title: '有效期',
        dataIndex: 'content.validityPeriod',
        render: (text, record) => {
          const { errorDetail } = record || {};
          if (errorDetail && errorDetail.item === 'validityPeriod') {
            return <Tooltip containerStyle={{ color: error }} text={text || replaceSign} length={20} />;
          }
          return <Tooltip text={text || replaceSign} length={20} />;
        },
      },
      {
        title: '产地',
        dataIndex: 'context.originPlaceTxt',
        render: (text, record) => {
          const { errorDetail } = record || {};
          if (errorDetail && errorDetail.item === 'originPlace') {
            return <Tooltip containerStyle={{ color: error }} text={text || replaceSign} length={20} />;
          }
          return <Tooltip text={text || replaceSign} length={20} />;
        },
      },
      {
        title: '备注',
        dataIndex: 'content.remark',
        render: (text, record) => {
          const { errorDetail } = record || {};
          if (errorDetail && errorDetail.item === 'remark') {
            return <Tooltip containerStyle={{ color: error }} text={text || replaceSign} length={20} />;
          }
          return <Tooltip text={text || replaceSign} length={20} />;
        },
      },
      {
        title: '供应商批次',
        dataIndex: 'content.mfgBatchCode',
        render: (text, record) => {
          const { errorDetail } = record || {};
          if (errorDetail && errorDetail.item === 'mfgBatchCode') {
            return <Tooltip containerStyle={{ color: error }} text={text || replaceSign} length={20} />;
          }
          return <Tooltip text={text || replaceSign} length={20} />;
        },
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
    const detailRes = await importLogDetail(params);
    const reasonRes = await importLogDetailReason(params);

    const detailData = _.get(detailRes, 'data.data');
    const { data: reasons, total } = _.get(reasonRes, 'data');

    const { createdAt, operatorName, status } = detailData || {};
    this.setState({
      data: {
        createdAt: formatUnix(createdAt),
        // content: data.content,
        userName: operatorName,
        status: (() => {
          if (status === 0) {
            return '导入失败';
          } else if (status === 1) {
            return '导入成功';
          }
          return '部分导入成功';
        })(),
      },
      detailList: reasons,
      loading: false,
      total,
    });
  };

  render() {
    const columns = this.getColumns();
    const { data, detailList, loading, total } = this.state;
    const { changeChineseToLocale } = this.context;

    return (
      <div id="materialImport_detail">
        <p
          style={{
            margin: '20px',
            fontSize: '16px',
          }}
        >
          {changeChineseToLocale('导入日志详情')}
        </p>
        <div style={{ marginBottom: 30 }}>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {changeChineseToLocale('导入时间')}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {data.createdAt}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {changeChineseToLocale('导入用户')}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {data.userName}
            </Col>
          </Row>
          <Row>
            <Col type={'title'} style={{ paddingLeft: 20 }}>
              {changeChineseToLocale('导入结果')}
            </Col>
            <Col type={'content'} style={{ width: 920 }}>
              {data.status}
            </Col>
          </Row>
        </div>
        <RestPagingTable
          srcoll={{ x: 1000 }}
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

qrCodeImportLogDetail.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseToLocale: PropTypes.any,
};

export default qrCodeImportLogDetail;
