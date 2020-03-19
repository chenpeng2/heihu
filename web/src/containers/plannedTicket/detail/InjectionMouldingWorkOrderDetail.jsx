import React from 'react';
import { SimpleTable, Link, Attachment, Row, Col, Tooltip } from 'components';
import _ from 'lodash';
import { getInjectionMouldingWorkOderDetail } from 'services/cooperate/plannedTicket';
import { toWorkOrderDetail, toEditWorkOrder } from 'views/cooperate/plannedTicket/navigation';
import {
  replaceSign,
  PLAN_TICKET_INJECTION_MOULDING,
  PROJECT_TYPE_PURCHASE_ORDER,
  PLAN_TICKET_STATUS_CANCELED,
} from 'constants';
import { formatDate, formatUnix } from 'utils/time';
import { getAttachments } from 'src/services/attachment';
import CancelPlannedTicket from 'src/containers/plannedTicket/base/cancelPlannedTicket';
import { arrayIsEmpty } from 'utils/array';
import { findPlannedTicketTypes, getWorkOrderStatus, getWorkOrderExecuteStatus } from '../util';

const AttachmentFile = Attachment.AttachmentFile;
const getPlanTime = (begin, end) => {
  if (!begin && !end) return replaceSign;
  return `${begin ? formatDate(begin) : replaceSign} ~ ${end ? formatDate(end) : replaceSign}`;
};

class InjectionMouldingWorkOrderDetail extends React.PureComponent {
  state = {
    data: null,
  };

  componentDidMount() {
    this.setData();
  }

  setData = async () => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    const {
      data: { data },
    } = await getInjectionMouldingWorkOderDetail(id);
    if (!arrayIsEmpty(data.attachments)) {
      const {
        data: { data: attachments },
      } = await getAttachments(data.attachments);
      data.attachments = attachments;
    }
    this.setState({ data });
  };

  render() {
    const { data } = this.state;
    if (!data) {
      return null;
    }
    const {
      type,
      code,
      subs,
      priority,
      planBeginTime,
      planEndTime,
      planners,
      managers,
      attachments,
      remark,
      purchaseOrderCode,
      purchaseOrderId,
      status,
      executeStatus,
      createdAt,
      fieldDTO,
      toolCode,
      outAmount,
    } = data;
    const {
      match: {
        params: { id },
      },
    } = this.props;
    const columns = [
      { title: '序号', key: 'no', render: (no, record, index) => index + 1 },
      { title: '物料编码/名称', key: 'material', render: (no, { code, name }) => `${code}/${name}` },
      {
        title: '规格',
        key: 'desc',
        dataIndex: 'desc',
        render: desc => (desc ? <Tooltip text={desc} length={12} /> : replaceSign),
      },
      { title: '单位', key: 'unit', dataIndex: 'unitName', render: unitName => unitName },
      { title: '总数量', key: 'totalAmount', dataIndex: 'totalAmount', render: totalAmount => totalAmount },
      { title: '单模产出数量', key: 'perAmount', dataIndex: 'perAmount', render: perAmount => perAmount },
      {
        title: '工艺',
        key: 'mbomVersion',
        dataIndex: 'mbomVersion',
        render: (mbomVersion, record) => (
          <Link.NewTagLink
            href={`/bom/mbom/${record.mbomId}/detail`}
          >{`生产BOM「 ${mbomVersion}版本 」`}</Link.NewTagLink>
        ),
      },
      {
        title: '普通计划工单',
        key: 'workOrderCode',
        dataIndex: 'workOrderCode',
        render: workOrderCode => (
          <Link
            to={toWorkOrderDetail({
              code: workOrderCode,
              isInjectionMouldingChild: true,
            })}
          >
            {workOrderCode}
          </Link>
        ),
      },
    ];
    let items = [
      { label: '计划工单类型', value: findPlannedTicketTypes(type).name },
      type === PROJECT_TYPE_PURCHASE_ORDER
        ? {
            label: '销售订单编号',
            value: (
              <Link.NewTagLink href={`/cooperate/purchaseOrders/${purchaseOrderId}/detail`}>
                {purchaseOrderCode}
              </Link.NewTagLink>
            ),
          }
        : undefined,
      { label: '计划工单编号', value: code },
      { label: '模具定义', value: toolCode || replaceSign },
      { label: '产出次数', value: outAmount },
      {
        label: '产出物料',
        value: <SimpleTable pagination={false} style={{ margin: 0, width: 800 }} dataSource={subs} columns={columns} />,
      },
      { label: '优先级', value: priority },
      { label: '计划时间', value: getPlanTime(planBeginTime, planEndTime) },
      { label: '计划员', value: _.map(planners, ({ name }) => name).join(',') },
      { label: '生产主管', value: _.map(managers, ({ name }) => name).join(',') },
      { label: '计划状态', value: getWorkOrderStatus(status) },
      { label: '执行状态', value: getWorkOrderExecuteStatus(executeStatus) },
      { label: '创建时间', value: formatUnix(createdAt) },
    ];

    if (!arrayIsEmpty(fieldDTO)) {
      items = items.concat(
        fieldDTO.map(e => ({
          label: e.name,
          value: e.content || replaceSign,
        })),
      );
    }
    items = items.concat(
      {
        label: '附件',
        value: arrayIsEmpty(attachments && attachments.filter(n => n)) ? replaceSign : AttachmentFile(attachments),
      },
      { label: '备注', value: remark },
    );
    items = items.filter(n => n);
    return (
      <div style={{ margin: 20 }}>
        <div className="vertical-center" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: 20 }}>计划工单详情</span>
          <div className="child-gap">
            {status !== PLAN_TICKET_STATUS_CANCELED && (
              <CancelPlannedTicket
                status={status}
                iconType={'close-circle-o'}
                code={code}
                fetchData={this.setData}
                category={PLAN_TICKET_INJECTION_MOULDING}
              />
            )}
            <Link
              disabled={status === PLAN_TICKET_STATUS_CANCELED}
              icon="edit"
              to={toEditWorkOrder({ category: PLAN_TICKET_INJECTION_MOULDING, code })}
            >
              编辑
            </Link>
            <Link
              icon="bars"
              to={`/cooperate/plannedTicket/injectionMoulding/detail/${id}/logs/operate/${PLAN_TICKET_INJECTION_MOULDING}`}
            >
              查看操作记录
            </Link>
          </div>
        </div>
        <div style={{ marginLeft: 20 }}>
          {items.map(({ label, value }) => (
            <Row key={label}>
              <Col type="title">{label}: </Col>
              <Col type="content" style={{ width: 700 }}>
                {value}
              </Col>
            </Row>
          ))}
        </div>
      </div>
    );
  }
}

export default InjectionMouldingWorkOrderDetail;
