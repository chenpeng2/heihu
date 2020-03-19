import React, { Component } from 'react';
import _ from 'lodash';
import { Spin, Steps } from 'antd';

import { thousandBitSeparator } from 'utils/number';
import LocalStorage from 'utils/localStorage';
import { arrayIsEmpty } from 'utils/array';
import { Row, Col, Attachment, message, Table, Link, Tooltip } from 'src/components';
import { replaceSign, FIELDS } from 'src/constants';
import { formatDate, formatDateTime } from 'utils/time';
import { cancelPlannedTicket, queryPlannedTicketDetail } from 'src/services/cooperate/plannedTicket';
import { isSubPlannedTicket } from 'src/containers/plannedTicket/util';
import AuditPlannedTicket from 'src/containers/plannedTicket/base/auditPlannedTicket';
import DeletePlannedTicket from 'src/containers/plannedTicket/base/DeletePlannedTicket';

import Actions from './actions';
import styles from '../styles.scss';
import { findPlannedTicketTypes, getAuditConfig, fetchAttachmentFiles, WORK_ORDER_PLAN_STATUS_CANCELED } from '../util';
import WorkOrderTreeProdProgressInfo from '../ProdProgress';
import Title from '../base/Title';

const AttachmentFile = Attachment.AttachmentFile;
const basePath = '/cooperate/plannedTicket';
const Step = Steps.Step;

type Props = {
  match: any,
};

class PlannedTicketDetail extends Component {
  props: Props;
  state = {
    data: {},
    loading: false,
  };

  componentDidMount = () => {
    this.fetchData();
  };

  cancelPlan = async () => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    await cancelPlannedTicket(decodeURIComponent(id)).then(async ({ data: { statusCode } }) => {
      if (statusCode === 200) {
        await this.fetchData();
        message.success('取消成功');
      }
    });
  };

  getPlanStatus = status => {
    switch (status) {
      case 1:
        return '新建';
      case 2:
        return '已排程';
      case 3:
        return '已下发';
      case 4:
        return '已取消';
      case 5:
        return '审批中';
      case 6:
        return '已审批';
      default:
        return replaceSign;
    }
  };

  getExecuteStatus = status => {
    switch (status) {
      case 0:
        return '未下发';
      case 1:
        return '未开始';
      case 2:
        return '进行中';
      case 3:
        return '暂停中';
      case 4:
        return '已结束';
      case 5:
        return '已取消';
      default:
        return replaceSign;
    }
  };

  fetchData = async () => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    this.setState({ loading: true });
    const {
      data: { data },
    } = await queryPlannedTicketDetail(decodeURIComponent(id));
    const attachmentFiles = await fetchAttachmentFiles(data.attachments);
    this.setState({ data: { ...data, attachmentFiles }, loading: false });
  };

  getPlanTime = (begin, end) => {
    if (!begin && !end) return replaceSign;
    return `${begin ? formatDate(begin) : replaceSign} ~ ${end ? formatDate(end) : replaceSign}`;
  };

  getProcess = type => {
    const { data } = this.state;
    const { mbomVersion, mbomId, ebomVersion, ebomId, processRouteCode, processRouteName } = data;
    if (type === 'processRoute') {
      const display = (
        <Link
          onClick={() => window.open(`/bom/processRoute/${processRouteCode}/detail`, '_blank')}
        >{`工艺路线「 ${processRouteCode}/${processRouteName} 」`}</Link>
      );
      return display;
    }
    if (type === 'mbom') {
      const display = (
        <Link onClick={() => window.open(`/bom/mBom/${mbomId}/detail`, '_blank')}>{`生产BOM「 ${mbomVersion ||
          replaceSign}版本 」`}</Link>
      );
      return display;
    }
    if (type === 'processRouteEbom') {
      const display = (
        <div>
          <Link onClick={() => window.open(`/bom/processRoute/${processRouteCode}/detail`, '_blank')}>
            {`工艺路线「 ${processRouteCode}/${processRouteName} 」`}
          </Link>
          +&nbsp;
          <Link
            onClick={() => window.open(`/bom/eBom/ebomdetail/${ebomId}`, '_blank')}
          >{`物料清单「 ${ebomVersion}版本 」`}</Link>
        </div>
      );
      return display;
    }
  };

  getColumns = () => {
    return [
      {
        title: '序号',
        dataIndex: 'processSeq',
      },
      {
        title: '工序名称',
        dataIndex: 'processName',
      },
      {
        title: '投入物料',
        dataIndex: 'inputMaterialDTO',
        render: data => {
          const text =
            Array.isArray(data) && data.length
              ? data
                  .map(i => {
                    const { materialCode, materialName } = i;
                    return `${materialCode}/${materialName}`;
                  })
                  .join(',')
              : replaceSign;

          return <Tooltip text={text} length={20} />;
        },
      },
      {
        title: '子计划工单',
        key: 'subPlannedTicket',
        render: (__, record) => {
          let subPlannedTickets = [];
          const inputMaterialDTO = _.get(record, 'inputMaterialDTO');

          if (Array.isArray(inputMaterialDTO)) {
            inputMaterialDTO.forEach(i => {
              const { subWorkOrderCodes } = i || {};
              if (Array.isArray(subWorkOrderCodes) && subWorkOrderCodes.length) {
                subPlannedTickets = subPlannedTickets.concat(subWorkOrderCodes);
              }
            });
          }

          const text =
            Array.isArray(subPlannedTickets) && subPlannedTickets.length ? subPlannedTickets.join(',') : replaceSign;
          return <Tooltip text={text} length={20} />;
        },
      },
      {
        title: '产出物料',
        dataIndex: 'outputMaterialDTO',
        render: data => {
          const { materialCode, materialName } = data || {};

          const text = materialCode && materialName ? `${materialCode}/${materialName}` : replaceSign;
          return <Tooltip text={text} length={20} />;
        },
      },
      {
        title: '排程进度',
        dataIndex: 'scheduleNum',
        render: (amount, { denominator }) => {
          const scheduledNum = typeof amount === 'number' ? thousandBitSeparator(amount) : replaceSign;
          const total = typeof denominator === 'number' ? thousandBitSeparator(denominator) : replaceSign;
          return `${scheduledNum}/${total}`;
        },
      },
      {
        title: '下发进度',
        dataIndex: 'distributeNum',
        render: (amount, { denominator }) => {
          const distributedNum = typeof amount === 'number' ? thousandBitSeparator(amount) : replaceSign;
          const total = typeof denominator === 'number' ? thousandBitSeparator(denominator) : replaceSign;
          return `${distributedNum}/${total}`;
        },
      },
    ];
  };

  getAuditProcess = (planStatus, auditProcess) => {
    const { failFlag, currPos, auditors } = auditProcess || {};
    const currAuditorId = _.get(auditors, `[${currPos}].id`);
    const userId = _.get(LocalStorage.get(FIELDS && FIELDS.USER_INFO), 'id');

    const getProcess = (currPos, index, audited) => {
      const diff = index - currPos;
      if (diff !== 0) {
        if (!audited) {
          return { status: 'wait', result: '未审批' };
        }
        if (audited) {
          return { status: 'finish', result: '已通过' };
        }
      }
      if (diff === 0) {
        if (failFlag) {
          return { status: 'error', result: '已驳回' };
        }
        if (!audited) {
          return { status: 'process', result: '未审批' };
        }
        if (!failFlag && audited) {
          return { status: 'finish', result: '已通过' };
        }
      }
    };

    if (auditors && auditors.length > 0) {
      return (
        <Steps className={styles.auditProcess} direction="vertical" size="small" current={currPos}>
          {auditors.map(({ id, name, audited, remark }, i) => {
            const process = getProcess(currPos, i, audited);
            const { status, result, icon } = process || {};
            const title = (
              <div>
                {name}
                <span className="tip">{result}</span>
                {planStatus === 5 && i === currPos && currAuditorId === userId && !failFlag ? (
                  <AuditPlannedTicket data={auditProcess} code={_.get(this.props, 'match.params.id')} />
                ) : null}
              </div>
            );
            // 已通过的才有「审批备注」
            return status === 'finish' ? (
              <Step icon={icon} status={status} title={title} description={remark || replaceSign} />
            ) : (
              <Step icon={icon} status={status} title={title} />
            );
          })}
        </Steps>
      );
    }
    return replaceSign;
  };

  renderTaskAuditors = auditors => {
    return auditors && auditors.map(({ ids }) => ids.map(({ name }) => name).join(',')).join('；');
  };

  render() {
    const { changeChineseToLocale } = this.context;
    const { data, loading } = this.state;
    const { taskAuditConfig, workOrderAuditConfig } = getAuditConfig();
    const id = decodeURIComponent(_.get(this.props, 'match.params.id'));

    const {
      code,
      amount,
      status,
      priority,
      createdAt,
      selectType,
      parentCode,
      managers,
      planners,
      planEndTime,
      materialName,
      materialCode,
      materialUnit,
      executeStatus,
      planBeginTime,
      attachmentFiles,
      processInfoList,
      purchaseOrderCode,
      purchaseOrderId,
      materialDesc,
      auditProcessDTO,
      type,
      needAudit,
      remark,
      productBatchType,
      productBatch,
      productBatchRuleName,
      taskAuditors,
      category,
      fieldDTO,
    } = data;
    const isSubPlanned = isSubPlannedTicket(data);
    const editPath = !isSubPlanned
      ? `${basePath}/detail/${encodeURIComponent(code)}/edit`
      : `${basePath}/detail/${encodeURIComponent(code)}/editSubPlannedTicket`;
    const logPath = `${basePath}/detail/${encodeURIComponent(id)}/logs/operate`;
    const createSonPlannedTicket = `${basePath}/${encodeURIComponent(id)}/createSonPlannedTicket`;
    const typeText = findPlannedTicketTypes(type) ? findPlannedTicketTypes(type).name : replaceSign;
    const plannerNames = planners && planners.map(({ name }) => name);
    const managerNames = managers && managers.map(({ name }) => name);
    const { isInjectionMouldingChild = false } = this.props;
    return (
      <Spin spinning={loading}>
        <div className={styles.pageStyle}>
          <div className={styles.pageHeader}>
            <p>{changeChineseToLocale('计划工单详情')}</p>
            {!isInjectionMouldingChild && (
              <div style={{ display: 'flex' }}>
                <DeletePlannedTicket code={code} status={status} category={category} style={{ marginRight: 30 }} />
                <Actions
                  parentCode={parentCode}
                  createSonPlannedTicket={createSonPlannedTicket}
                  editPath={editPath}
                  logPath={logPath}
                  status={status}
                  needAudit={needAudit}
                  cancelPlan={this.cancelPlan}
                  code={code}
                  category={category}
                  fetchData={this.fetchData}
                />
              </div>
            )}
          </div>
          <Row>
            <Col type="title">工单类型</Col>
            <Col type="content" style={{ width: 620 }}>
              {typeText || replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type="title">销售订单</Col>
            <Col type="content" style={{ width: 620 }}>
              {purchaseOrderCode ? (
                <Link onClick={() => window.open(`/cooperate/purchaseOrders/${purchaseOrderId}/detail`, '_blank')}>
                  {purchaseOrderCode}
                </Link>
              ) : (
                replaceSign
              )}
            </Col>
          </Row>
          <Row>
            <Col type="title">计划工单编号</Col>
            <Col type="content" style={{ width: 620 }}>
              {code || replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type="title">产出物料</Col>
            <Col type="content" style={{ width: 620 }}>
              {`${materialCode || replaceSign} / ${materialName || replaceSign}`}
            </Col>
          </Row>
          <Row>
            <Col type="title">规格</Col>
            <Col type="content" style={{ width: 620 }}>
              {materialDesc || replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type="title">数量</Col>
            <Col type="content" style={{ width: 620 }}>
              {amount ? `${thousandBitSeparator(amount)}${materialUnit}` : replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type="title">成品批次</Col>
            <Col type="content" style={{ width: 620 }}>
              {typeof productBatchType === 'number'
                ? productBatchType === 1
                  ? productBatch
                  : `规则 ${productBatchRuleName}`
                : replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type="title">计划员</Col>
            <Col type="content" style={{ width: 620 }}>
              {_.get(plannerNames, 'length') ? _.join(plannerNames, '，') : replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type="title">生产主管</Col>
            <Col type="content" style={{ width: 620 }}>
              {_.get(managerNames, 'length') ? _.join(managerNames, '，') : replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type="title">优先级</Col>
            <Col type="content" style={{ width: 620 }}>
              {priority || replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type="title">计划状态</Col>
            <Col type="content" style={{ width: 620 }}>
              {this.getPlanStatus(status)}
            </Col>
          </Row>
          <Row>
            <Col type="title">执行状态</Col>
            <Col type="content" style={{ width: 620 }}>
              {this.getExecuteStatus(executeStatus)}
            </Col>
          </Row>
          <Row>
            <Col type="title">创建时间</Col>
            <Col type="content" style={{ width: 620 }}>
              {createdAt ? formatDateTime(createdAt) : replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type="title">计划时间</Col>
            <Col type="content" style={{ width: 620 }}>
              {this.getPlanTime(planBeginTime, planEndTime)}
            </Col>
          </Row>
          <Row>
            <Col type="title">工艺</Col>
            <Col type="content" style={{ width: 620 }}>
              {this.getProcess(selectType)}
            </Col>
          </Row>
          {taskAuditConfig === 'true' ? (
            <Row>
              <Col type="title">生产任务审批人</Col>
              <Col type="content" style={{ width: 620 }}>
                {_.get(taskAuditors, 'length') > 0 ? this.renderTaskAuditors(taskAuditors) : replaceSign}
              </Col>
            </Row>
          ) : null}
          {parentCode || workOrderAuditConfig !== 'true' || (workOrderAuditConfig === 'true' && !needAudit) ? null : (
            <Row>
              <Col type="title">工单审批进度</Col>
              <Col type="content" style={{ width: 620 }}>
                {this.getAuditProcess(status, auditProcessDTO)}
              </Col>
            </Row>
          )}
          <Row>
            <Col type="title">附件</Col>
            <Col type="content" style={{ width: 420 }}>
              {arrayIsEmpty(attachmentFiles) ? replaceSign : AttachmentFile(attachmentFiles)}
            </Col>
          </Row>
          <Row>
            <Col type="title">备注</Col>
            <Col type="content" style={{ width: 590 }}>
              {remark || replaceSign}
            </Col>
          </Row>
          {!arrayIsEmpty(fieldDTO)
            ? fieldDTO.map(e => (
                <Row>
                  <Col type="title">{e.name}</Col>
                  <Col type="content" style={{ width: 590 }}>
                    {e.content || replaceSign}
                  </Col>
                </Row>
              ))
            : null}
          {!isInjectionMouldingChild && (
            <div style={{ marginTop: 10, marginBottom: 80 }}>
              <Title>工单相关生产进度</Title>
              <WorkOrderTreeProdProgressInfo workOrderCode={code} />
            </div>
          )}
        </div>
      </Spin>
    );
  }
}

PlannedTicketDetail.contextTypes = {
  changeChineseToLocale: () => {},
};

export default PlannedTicketDetail;
