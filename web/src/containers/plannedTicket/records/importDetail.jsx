import React, { Component } from 'react';
import { Row, Col, RestPagingTable, Tooltip } from 'components';
import { queryPlannedTicketImportDetail } from 'src/services/cooperate/plannedTicket';
import { thousandBitSeparator } from 'utils/number';
import { formatDate, formatUnix } from 'utils/time';
import { replaceSign } from 'src/constants';

import { getAuditConfig } from '../util';

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
    detailList: [],
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
    } = await queryPlannedTicketImportDetail(id);
    const { detailList, planWorkOrderImportDTO } = data || {};
    this.setState({
      data: planWorkOrderImportDTO,
      detailList,
      loading: false,
      pagination: {
        total: detailList && detailList.length,
        pageSize: 10,
        current: 1,
      },
    });
  };

  getColumns = () => {
    const { taskAuditConfig, workOrderAuditConfig } = getAuditConfig();
    const flexibleColumns = [];
    if (taskAuditConfig === 'true') {
      flexibleColumns.push({
        title: '生产任务审批人',
        dataIndex: 'taskAuditorName',
        width: 200,
        render: text => (text ? <Tooltip text={text} length={25} /> : replaceSign),
      });
    }
    if (workOrderAuditConfig === 'true') {
      flexibleColumns.push({
        title: '工单审批人',
        dataIndex: 'auditorName',
        width: 200,
        render: text => (text ? <Tooltip text={text} length={25} /> : replaceSign),
      });
    }
    const columns = [
      {
        title: '失败原因',
        dataIndex: 'reason',
        width: 200,
        render: text => (text ? <Tooltip text={text} length={25} /> : replaceSign),
      },
      {
        title: '父计划工单编号',
        width: 120,
        dataIndex: 'parentCode',
        render: text => (text ? <Tooltip text={text} length={15} /> : replaceSign),
      },
      {
        title: '计划工单类型',
        width: 120,
        dataIndex: 'type',
        render: data => {
          if (data === 1) return <span>面向库存</span>;
          if (data === 2) return <span>面向销售订单</span>;
          return replaceSign;
        },
      },
      {
        title: '计划工单编号',
        dataIndex: 'planWorkOrderCode',
        width: 120,
        render: text => (text ? <Tooltip text={text} length={15} /> : replaceSign),
      },
      {
        title: '订单编号',
        dataIndex: 'purchaseOrderCode',
        width: 120,
        render: text => (text ? <Tooltip text={text} length={15} /> : replaceSign),
      },
      {
        title: '产出物料编号',
        dataIndex: 'materialCode',
        width: 120,
        render: text => (text ? <Tooltip text={text} length={20} /> : replaceSign),
      },
      {
        title: '数量',
        dataIndex: 'amount',
        width: 120,
        render: text => (text >= 0 ? thousandBitSeparator(text) : replaceSign),
      },
      {
        title: '成品批次生成方式',
        dataIndex: 'productBatchType',
        width: 120,
        render: text => text || replaceSign,
      },
      {
        title: '成品批次',
        dataIndex: 'productBatch',
        width: 120,
        render: text => (text ? <Tooltip text={text} length={20} /> : replaceSign),
      },
      {
        title: '父工单工序序号',
        width: 120,
        dataIndex: 'parentSeq',
        render: text => (text ? <Tooltip text={text} length={20} /> : replaceSign),
      },
      {
        title: '计划员',
        width: 120,
        dataIndex: 'plannerName',
        render: text => text || replaceSign,
      },
      {
        title: '生产主管',
        width: 120,
        dataIndex: 'managerName',
        render: text => text || replaceSign,
      },
      {
        title: '优先级',
        width: 120,
        dataIndex: 'priority',
        render: text => (text >= 0 ? thousandBitSeparator(text) : replaceSign),
      },
      {
        title: '计划开始时间',
        dataIndex: 'planBeginTime',
        width: 120,
        render: text => (text ? formatDate(text) : replaceSign),
      },
      {
        title: '计划结束时间',
        dataIndex: 'planEndTime',
        width: 120,
        render: text => (text ? formatDate(text) : replaceSign),
      },
      ...flexibleColumns,
      {
        title: '备注',
        width: 120,
        dataIndex: 'remark',
        render: text => (text ? <Tooltip text={text} length={20} /> : replaceSign),
      },
      {
        title: '工艺路线编号',
        dataIndex: 'processRouteCode',
        width: 120,
        render: text => text || replaceSign,
      },
      {
        title: '物料清单版本号',
        dataIndex: 'ebomVersion',
        width: 120,
        render: text => text || replaceSign,
      },
      {
        title: '生产BOM版本号',
        dataIndex: 'mbomVersion',
        width: 120,
        render: text => text || replaceSign,
      },
    ];
    return columns;
  };

  render() {
    const colums = this.getColumns();
    const { data, detailList, loading, pagination, count } = this.state;
    const { createdAt, userName, status, successAmount, failureAmount } = data;
    const total = count || 1;

    return (
      <div>
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
            <Col
              type="content"
              style={{ width: 920 }}
            >{`计划工单导入完成！成功数：${successAmount}，失败数：${failureAmount}。`}</Col>
          </Row>
        </div>
        <RestPagingTable
          dataSource={detailList}
          rowKey={record => record.id}
          columns={colums}
          loading={loading}
          scroll={{ x: 2900 }}
          pagination={pagination}
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

export default PlannedTicketImportDetail;
