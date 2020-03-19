import React, { Component } from 'react';
import _ from 'lodash';
import { Spin, Steps } from 'antd';

import { thousandBitSeparator } from 'utils/number';
import LocalStorage from 'utils/localStorage';
import { Icon, Row, Col, Attachment, message, Table, Link, Tooltip, SimpleTable } from 'src/components';
import { replaceSign, FIELDS } from 'src/constants';
import { formatDate, formatDateTime } from 'utils/time';
import { cancelPlannedTicket, queryBaitingWorkOrderDetail } from 'src/services/cooperate/plannedTicket';
import AuditPlannedTicket from 'src/containers/plannedTicket/base/auditPlannedTicket';
import { arrayIsEmpty } from 'utils/array';
import { success, error } from 'src/styles/color';

import Actions from './actions';
import styles from '../styles.scss';
import { findPlannedTicketTypes, getAuditConfig, fetchAttachmentFiles } from '../util';

const AttachmentFile = Attachment.AttachmentFile;
const basePath = '/cooperate/plannedTicket';
const Step = Steps.Step;

type Props = {
  match: any,
  code: String,
};

class BaitingWorkOrderDetail extends Component {
  props: Props;
  state = {
    data: {},
    loading: false,
  };

  componentDidMount = () => {
    this.fetchData();
  };

  cancelPlan = async () => {
    const code = _.get(this.props, 'match.params.id');
    await cancelPlannedTicket(decodeURIComponent(code)).then(async ({ data: { statusCode } }) => {
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
    const code = _.get(this.props, 'match.params.id');
    console.log(code);

    this.setState({ loading: true });
    const {
      data: { data },
    } = await queryBaitingWorkOrderDetail(decodeURIComponent(code));
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
          const text = !arrayIsEmpty(data)
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
      // {
      //   title: '子计划工单',
      //   key: 'subPlannedTicket',
      //   render: (__, record) => {
      //     let subPlannedTickets = [];
      //     const inputMaterialDTO = _.get(record, 'inputMaterialDTO');

      //     if (Array.isArray(inputMaterialDTO)) {
      //       inputMaterialDTO.forEach(i => {
      //         const { subWorkOrderCodes } = i || {};
      //         if (Array.isArray(subWorkOrderCodes) && subWorkOrderCodes.length) {
      //           subPlannedTickets = subPlannedTickets.concat(subWorkOrderCodes);
      //         }
      //       });
      //     }

      //     const text = Array.isArray(subPlannedTickets) && subPlannedTickets.length ? subPlannedTickets.join(',') : replaceSign;
      //     return <Tooltip text={text} length={20} />;
      //   },
      // },
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
        dataIndex: 'scheduleProgress',
      },
      {
        title: '下发进度',
        dataIndex: 'distributeProgress',
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
    const names = auditors && auditors.map(({ name }) => name);
    return _.join(names, ',');
  };

  getOutMaterialColumns = () => {
    const perAmountTooltip = (
      <Tooltip
        title={
          <div style={{ padding: 10 }}>
            <div style={{ color: 'black', fontSize: 14, marginBottom: 8 }}>单次产出数量</div>
            <div style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
              同一生产过程，不同物料同时产出时，单次产出的数量。例如：一块木板裁切成多种形状的半成品物料，
              每种半成品物料的数量。所有产出物料（单次产出数量/总数量）的比值须一致。
            </div>
          </div>
        }
      >
        <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
      </Tooltip>
    );
    const perAmountTitle = (
      <div>
        <span style={{ marginRight: 6 }}>单次产出数量</span>
        {perAmountTooltip}
      </div>
    );
    return [
      {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        render: (data, record, index) => index + 1,
      },
      {
        title: '物料编号',
        dataIndex: 'code',
        key: 'code',
        render: code => (code ? <Tooltip text={code} length={15} /> : replaceSign),
      },
      {
        title: '物料名称',
        dataIndex: 'name',
        key: 'name',
        render: name => (name ? <Tooltip text={name} length={15} /> : replaceSign),
      },
      {
        title: '规格',
        dataIndex: 'desc',
        key: 'desc',
        render: desc => (desc ? <Tooltip text={desc} length={15} /> : replaceSign),
      },
      {
        title: '单位',
        dataIndex: 'unitName',
        key: 'unitName',
        render: unitName => (unitName ? <Tooltip text={unitName} length={10} /> : replaceSign),
      },
      {
        title: '总数量',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        render: amount => (amount ? thousandBitSeparator(amount) : replaceSign),
      },
      {
        title: perAmountTitle,
        dataIndex: 'perAmount',
        key: 'perAmount',
        render: amount => (amount ? thousandBitSeparator(amount) : replaceSign),
      },
    ];
  };

  getInMaterialColumns = () => {
    const perAmountTooltip = (
      <Tooltip
        title={
          <div style={{ padding: 10 }}>
            <div style={{ color: 'black', fontSize: 14, marginBottom: 8 }}>单次产出用料量</div>
            <div style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
              同一生产过程，不同物料同时产出时，产出“单次产出数量”的物料时，所用的投入物料数量。例如：投入一块木板裁切成多种形状的半成品物料，单次产出用料量为1块。
            </div>
          </div>
        }
      >
        <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
      </Tooltip>
    );
    const perAmountTitle = (
      <div>
        <span style={{ marginRight: 6 }}>单次产出用料量</span>
        {perAmountTooltip}
      </div>
    );
    return [
      {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        render: (data, record, index) => index + 1,
      },
      {
        title: '物料编号',
        dataIndex: 'code',
        key: 'code',
        render: code => (code ? <Tooltip text={code} length={10} /> : replaceSign),
      },
      {
        title: '物料名称',
        dataIndex: 'name',
        key: 'name',
        render: name => (name ? <Tooltip text={name} length={20} /> : replaceSign),
      },
      {
        title: '规格',
        dataIndex: 'desc',
        key: 'desc',
        render: name => (name ? <Tooltip text={name} length={20} /> : replaceSign),
      },
      {
        title: '单位',
        dataIndex: 'unitName',
        key: 'unitName',
        render: unitName => (unitName ? <Tooltip text={unitName} length={10} /> : replaceSign),
      },
      {
        title: '总数量',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        render: amount => (amount ? thousandBitSeparator(amount) : replaceSign),
      },
      {
        title: perAmountTitle,
        dataIndex: 'perAmount',
        key: 'perAmount',
        render: amount => (amount ? thousandBitSeparator(amount) : replaceSign),
      },
    ];
  };

  render() {
    const { data, loading } = this.state;

    const {
      code,
      amount,
      status,
      priority,
      createdAt,
      selectType,
      parentCode,
      planners,
      managers,
      planEndTime,
      materialUnit,
      executeStatus,
      planBeginTime,
      attachmentFiles,
      processInfoList,
      purchaseOrderCode,
      purchaseOrderId,
      inMaterial,
      outMaterial,
      type,
      needAudit,
      remark,
      fieldDTO,
      category,
    } = data;
    const editPath = `${basePath}/baiting/detail/${encodeURIComponent(code)}/edit`;
    const logPath = `${basePath}/baiting/detail/${encodeURIComponent(code)}/logs/operate`;
    const typeText = findPlannedTicketTypes(type) ? findPlannedTicketTypes(type).name : replaceSign;
    const _processInfoList = processInfoList
      ? processInfoList.map(x => {
          x.processSeq = Number(x.processSeq);
          return x;
        })
      : [];
    const sortedProcessInfoList = _.orderBy(_processInfoList, ['processSeq'], ['asc']);
    const plannerNames = planners && planners.map(({ name }) => name);
    const managerNames = managers && managers.map(({ name }) => name);
    const outputTooltip = (
      <Tooltip
        title={
          <div style={{ padding: 10 }}>
            <div style={{ color: 'black', fontSize: 14, marginBottom: 8 }}>产出物料</div>
            <div style={{ color: 'rgba(0, 0, 0, 0.4)' }}>至少添加两种，支持从EXCEL中复制内容后直接粘贴至此列表。</div>
          </div>
        }
      >
        <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
      </Tooltip>
    );
    const outputLabel = (
      <div>
        <span style={{ marginRight: 6 }}>产出物料</span>
        {outputTooltip}
      </div>
    );
    const processRoutingTooltip = (
      <Tooltip
        title={
          <div style={{ padding: 10 }}>
            <div style={{ color: 'black', fontSize: 14, marginBottom: 8 }}>工艺</div>
            <div style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
              下料计划工单的工艺限制为工艺路线，不可更改。所选择的工艺路线有且仅有一道工序。
            </div>
          </div>
        }
      >
        <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} />
      </Tooltip>
    );
    const processRoutingLable = (
      <div style={{ display: 'inline-block' }}>
        <span style={{ marginRight: 6 }}>工艺</span>
        {processRoutingTooltip}
      </div>
    );

    return (
      <Spin spinning={loading}>
        <div className={styles.pageStyle}>
          <div className={styles.pageHeader}>
            <p>计划工单详情</p>
            <Actions
              category={category}
              parentCode={parentCode}
              editPath={editPath}
              logPath={logPath}
              status={status}
              needAudit={needAudit}
              cancelPlan={this.cancelPlan}
              code={code}
              fetchData={this.fetchData}
            />
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
            <Col type="title">{outputLabel}</Col>
            <Col type="content" style={{ width: 920 }}>
              <SimpleTable
                style={{ margin: 0 }}
                rowKey={record => record.code}
                columns={this.getOutMaterialColumns()}
                pagination={false}
                dataSource={outMaterial}
              />
            </Col>
          </Row>
          <Row>
            <Col type="title">投入物料</Col>
            <Col type="content" style={{ width: 920 }}>
              <SimpleTable
                style={{ margin: 0 }}
                rowKey={record => record.code}
                columns={this.getInMaterialColumns()}
                pagination={false}
                dataSource={inMaterial}
              />
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
            <Col type="title">{processRoutingLable}</Col>
            <Col type="content" style={{ width: 620 }}>
              {this.getProcess(selectType)}
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
          <Row>
            <Col type="title">附件</Col>
            <Col type="content" style={{ width: 420 }}>
              {attachmentFiles && attachmentFiles.length !== 0 ? AttachmentFile(attachmentFiles) : replaceSign}
            </Col>
          </Row>
          <Row>
            <Col type="title">备注</Col>
            <Col type="content" style={{ width: 590 }}>
              {remark || replaceSign}
            </Col>
          </Row>
        </div>
      </Spin>
    );
  }
}

export default BaitingWorkOrderDetail;
