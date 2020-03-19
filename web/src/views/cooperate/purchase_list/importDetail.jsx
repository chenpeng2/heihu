import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Row, Col, RestPagingTable, Tooltip, Spin } from 'components';
import moment from 'utils/time';
import { getCustomLanguage } from 'src/utils/customLanguage';
import { replaceSign } from 'src/constants';
import { purchaseListImportDetail } from 'src/services/cooperate/purchase_list';
import { getQuery } from 'src/routes/getRouteParams';
import { ORGANIZATION_CONFIG, getOrganizationConfigFromLocalStorage } from 'src/utils/organizationConfig';
import styles from './styles.scss';

type Props = {
  viewer: any,
  relay: any,
  match: any,
  params: {
    materialId: string,
  },
};
const customLanguage = getCustomLanguage();

class MaterialImportDetail extends Component {
  props: Props;
  state = {
    loading: false,
    data: null,
    detailList: [],
    importId: '',
    pagination: {},
  };

  componentWillMount() {
    const { match } = this.props;
    const { importId } = match.params;
    const config = getOrganizationConfigFromLocalStorage();
    this.setState(
      {
        importId,
        config,
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

  getColumns = () => {
    const { config } = this.state;
    const configValue =
      config &&
      config[ORGANIZATION_CONFIG.taskDispatchType] &&
      config[ORGANIZATION_CONFIG.taskDispatchType].configValue;
    const useQrCode = config && config.config_use_qrcode.configValue;
    const columns = [
      {
        title: '失败原因',
        dataIndex: 'reason',
        width: 230,
        render: text => <Tooltip text={text || replaceSign} length={22} />,
      },
      {
        title: '编号',
        dataIndex: 'procureOrderCode',
        width: 140,
        render: text => <Tooltip text={text} length={20} />,
      },
      {
        title: '处理人',
        width: 100,
        dataIndex: 'name',
        render: text => <Tooltip text={text || replaceSign} length={30} />,
      },
      useQrCode === 'true'
        ? {
            title: '供应商',
            width: 140,
            dataIndex: 'supplierCode',
            render: text => <Tooltip text={text || replaceSign} length={12} />,
          }
        : null,
      {
        title: '物料编号',
        width: 140,
        dataIndex: 'materialCode',
        render: text => <Tooltip text={text} length={20} />,
      },
      {
        title: '数量',
        width: 80,
        dataIndex: 'amountPlanned',
      },
      {
        title: '单位',
        width: 80,
        dataIndex: 'unitName',
        render: data => data || replaceSign,
      },
      {
        title: '订单编号',
        width: 140,
        dataIndex: 'purchaseOrderCode',
        render: text => <Tooltip text={text || replaceSign} length={20} />,
      },
      {
        title: configValue === 'manager' ? '计划工单编号' : '项目编号',
        width: 140,
        dataIndex: configValue === 'manager' ? 'planWorkOrderCode' : 'projectCode',
        render: text => <Tooltip text={text || replaceSign} length={20} />,
      },
      {
        title: '需求时间',
        width: 100,
        dataIndex: 'demandTime',
      },
      {
        title: '关注人',
        width: 100,
        dataIndex: 'concernedPersonName',
        render: text => <Tooltip text={text || replaceSign} length={12} />,
      },
      {
        title: '备注',
        width: 200,
        dataIndex: 'note',
        render: text => <Tooltip text={text || replaceSign} length={15} />,
      },
    ];
    return columns;
  };

  fetchData = async params => {
    const { importId } = this.state;
    params = { importId, ...params };
    this.setState({ loading: true });
    const res = await purchaseListImportDetail(params);
    const { data } = res.data;
    this.setState({
      data,
      loading: false,
      pagination: {
        total: res.data.count,
        current: res.data.page,
      },
    });
  };

  render() {
    const colums = _.compact(this.getColumns());
    const { data, loading, pagination } = this.state;
    const total = this.state.count || 1;
    const { importLog, failedItems } = data || {};
    return (
      <Spin spinning={loading}>
        {data ? (
          <div id="materialImport_detail">
            <p className={styles.detailLogHeader}>导入日志详情</p>
            <div style={{ marginBottom: 30 }}>
              <Row>
                <Col type={'title'} style={{ paddingLeft: 20 }}>
                  {'导入时间'}
                </Col>
                <Col type={'content'} style={{ width: 920 }}>
                  {moment(importLog.importAt).format('YYYY/MM/DD HH:mm:ss')}
                </Col>
              </Row>
              <Row>
                <Col type={'title'} style={{ paddingLeft: 20 }}>
                  {'导入用户'}
                </Col>
                <Col type={'content'} style={{ width: 920 }}>
                  {importLog.operatorName}
                </Col>
              </Row>
              <Row>
                <Col type={'title'} style={{ paddingLeft: 20 }}>
                  {'导入结果'}
                </Col>
                <Col type={'content'} style={{ width: 920 }}>
                  {importLog.status === 1 ? '导入成功' : importLog.status === 2 ? '导入部分成功' : '导入失败'}
                </Col>
              </Row>
              <Row>
                <Col type={'title'} style={{ paddingLeft: 20 }}>
                  {'导入详情'}
                </Col>
                <Col type={'content'} style={{ width: 920 }}>{`${customLanguage.procure_order}导入完成！成功数：${
                  importLog.successAmount
                }，失败数：${importLog.failureAmount}。`}</Col>
              </Row>
            </div>
            <RestPagingTable
              dataSource={failedItems}
              refetch={this.fetchData}
              total={total}
              rowKey={record => record.id}
              columns={colums}
              onChange={(pagination, filters, sorter) => {
                this.setState({ pagination });
              }}
              pagination={pagination}
              bordered
              scroll={{ x: true }}
            />
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%' }} />
        )}
      </Spin>
    );
  }
}

MaterialImportDetail.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default MaterialImportDetail;
