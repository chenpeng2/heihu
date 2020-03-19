import React, { Component } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { Row, Col, Icon, Attachment, Tooltip, SimpleTable, Link } from 'src/components';
import moment from 'src/utils/time';
import {
  ORGANIZATION_CONFIG,
  TASK_DISPATCH_TYPE,
  includeOrganizationConfig,
  getOrganizationConfigFromLocalStorage,
} from 'src/utils/organizationConfig';
import { thousandBitSeparator } from 'src/utils/number';
import { replaceSign } from 'src/constants';
import { border, primary } from 'src/styles/color';
import PurchaseListProgressModal from 'src/containers/project/base/purchaseListProgressModal';
import { getPurchaseProgress, getProjectBatchRecordUrl } from 'src/services/cooperate/project';
import { PROJECT_TYPES } from 'src/containers/project/constant';
import { getBatchTemplateByName } from 'src/services/process';
import log from 'utils/log';
import { arrayIsEmpty } from 'utils/array';
import {
  PROJECT_STATUS_FINISHED,
  PROJECT_STATUS_EXECUTING,
  PROJECT_STATUS_SUSPENDING,
  PROJECT_STATUS_CANCELED,
  PROJECT_STATUS_UNSTARTED,
} from 'src/views/cooperate/project/constants';
import styles from './detailCard.scss';
import { getCraftType } from '../utils';
import BatchRecordAuditLink from '../base/BatchRecordAuditLink';
import BatchRecordAuditProcess from '../base/BatchRecordAuditProcess';
import {
  BATCH_RECORD_STATUS_PASSED,
  BATCH_RECORD_STATUS_UNSTARTED,
  BATCH_RECORD_STATUS_FAILED,
  projectBatchRecordAuditStatusMap,
} from '../constant';

const AttachmentView = Attachment.InlineView;
const baseLinkStyle = { paddingRight: 10, display: 'inline-block' };

type Props = {
  projectData: {},
  onSwitchClick: () => {},
  fetchProjectData: () => {},
};

class DetailCard extends Component {
  props: Props;
  state = {
    showDetail: false,
    attachments: [],
    taskDispatchType: null,
    modalVisible: false,
    modalData: null,
  };

  componentDidMount() {
    this.getAndSetTaskDispatchType();
  }

  getProjectBatchRecordUrl = async projectCode => {
    try {
      if (projectCode) {
        const res = await getProjectBatchRecordUrl(projectCode);
        return _.get(res, 'data.data');
      }
    } catch (error) {
      console.log(error);
    }
  };

  getAndSetTaskDispatchType = () => {
    const configs = getOrganizationConfigFromLocalStorage();
    this.setState({
      taskDispatchType: configs[ORGANIZATION_CONFIG.taskDispatchType].configValue,
    });
  };

  getOutMaterialColumns = () => {
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
        title: '进度',
        dataIndex: 'actualAmount',
        key: 'actualAmount',
        render: (amount, record) => {
          const { unitName, totalAmount } = record;
          return `${amount ? thousandBitSeparator(amount) : replaceSign}/${thousandBitSeparator(
            totalAmount,
          )} ${unitName || replaceSign}`;
        },
      },
      {
        title: '数量',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        render: (amount, record) => {
          const { unitName } = record;
          return `${amount ? thousandBitSeparator(amount) : replaceSign} ${unitName || replaceSign}`;
        },
      },
      {
        title: '规格',
        dataIndex: 'desc',
        key: 'desc',
        render: desc => (desc ? <Tooltip text={name} length={15} /> : replaceSign),
      },
    ];
  };

  getInMaterialColumns = () => {
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
        title: '数量',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        render: (amount, record) => {
          const { unitName } = record;
          return `${amount ? thousandBitSeparator(amount) : replaceSign} ${unitName || replaceSign}`;
        },
      },
      {
        title: '进度',
        dataIndex: 'actualAmount',
        key: 'actualAmount',
        render: (amount, record) => {
          const { unitName, totalAmount } = record;
          return `${typeof amount === 'number' ? thousandBitSeparator(amount) : replaceSign}/${thousandBitSeparator(
            totalAmount,
          )} ${unitName || replaceSign}`;
        },
      },
    ];
  };

  renderBaitingProjectInfo = ({ projectTypeText, statusDisplay, ...projectData }) => {
    const { projectCode, startTimePlanned, endTimePlanned, inputMaterial, outputMaterial } = projectData || {};
    return (
      <div>
        <Row>
          <Col type={'title'}>项目类型</Col>
          <Col type={'content'}>{<Tooltip text={projectTypeText} length={20} />}</Col>
          <Col type={'title'}>项目编号</Col>
          <Col type={'content'}>{projectCode ? <Tooltip text={projectCode} length={20} /> : replaceSign}</Col>
          <Col type={'title'}>状态</Col>
          <Col type={'content'}>{statusDisplay || replaceSign}</Col>
        </Row>
        <Row>
          <Col type={'title'}>产出物料</Col>
          <Col type={'content'} style={{ width: 800 }}>
            <SimpleTable
              style={{ margin: 0 }}
              rowKey={record => record.code}
              columns={this.getOutMaterialColumns()}
              pagination={false}
              dataSource={outputMaterial}
            />
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>投入物料</Col>
          <Col type={'content'} style={{ width: 800 }}>
            <SimpleTable
              style={{ margin: 0 }}
              rowKey={record => record.code}
              columns={this.getInMaterialColumns()}
              pagination={false}
              dataSource={inputMaterial}
            />
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>计划时间</Col>
          <Col type={'content'}>
            {startTimePlanned ? moment(startTimePlanned).format('YYYY/MM/DD') : replaceSign}
            {replaceSign}
            {endTimePlanned ? moment(endTimePlanned).format('YYYY/MM/DD') : replaceSign}
          </Col>
        </Row>
      </div>
    );
  };

  renderBasicInfo = () => {
    const { projectData } = this.props;
    const {
      type,
      projectCode,
      product,
      amountProductPlanned,
      status,
      startTimePlanned,
      endTimePlanned,
      category,
      children,
    } = projectData || {};

    const { name: productName, unit, code: productCode } = product || {};
    const { display: statusDisplay } = status || {};
    let projectTypeText = replaceSign;
    if (type === 1) {
      projectTypeText = PROJECT_TYPES.storage.name;
    }
    if (type === 2) {
      projectTypeText = PROJECT_TYPES.purchaseOrderType.name;
    }
    if (Number(category) === 2) {
      return this.renderBaitingProjectInfo({
        projectTypeText,
        statusDisplay,
        ...projectData,
      });
    }
    const columns = [
      { title: '序号', render: (i, record, index) => index, key: 'index' },
      {
        title: '物料编码/名称',
        key: 'material',
        render: (i, { outputMaterial }) => {
          const { code, name } = outputMaterial[0];
          return `${code}/${name}`;
        },
      },
      {
        title: '数量',
        dataIndex: 'productAmount',
        key: 'productAmount',
        render: amount => (typeof amount === 'number' ? thousandBitSeparator(amount) : replaceSign),
      },
      {
        title: '进度',
        key: 'progress',
        render: (i, record) => {
          const { amountProductCompleted, outputMaterial } = record;
          const { totalAmount } = outputMaterial[0];
          return `${thousandBitSeparator(amountProductCompleted)}/${thousandBitSeparator(totalAmount)}`;
        },
      },
      { title: '规格', dataIndex: 'description', key: 'description' },
      { title: '工艺' },
      { title: '普通项目', dataIndex: 'parentCode', key: 'parentCode' },
    ];

    return (
      <div>
        <Row>
          <Col type={'title'}>项目类型</Col>
          <Col type={'content'}>{<Tooltip text={projectTypeText} length={20} />}</Col>
          <Col type={'title'}>项目编号</Col>
          <Col type={'content'}>{projectCode ? <Tooltip text={projectCode} length={20} /> : replaceSign}</Col>
          <Col type={'title'}>产出物料</Col>
          <Col type={'content'}>
            {productName ? <Tooltip text={`${productCode}/${productName}`} length={30} /> : replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>数量</Col>
          <Col type={'content'}>
            {typeof amountProductPlanned === 'number' ? (
              <Tooltip text={`${thousandBitSeparator(amountProductPlanned)} ${unit}`} length={20} />
            ) : (
              replaceSign
            )}
          </Col>
          <Col type={'title'}>状态</Col>
          <Col type={'content'}>{statusDisplay || replaceSign}</Col>
          <Col type={'title'}>计划时间</Col>
          <Col type={'content'}>
            {startTimePlanned ? moment(startTimePlanned).format('YYYY/MM/DD') : replaceSign}
            {replaceSign}
            {endTimePlanned ? moment(endTimePlanned).format('YYYY/MM/DD') : replaceSign}
          </Col>
        </Row>
        {children && children.length > 0 && (
          <Row>
            <Col type="title">产出物料 </Col>
            <SimpleTable columns={columns} dataSource={children} pagination={false} style={{ margin: 0, width: 800 }} />
          </Row>
        )}
      </div>
    );
  };

  renderBaitingDetailInfo = projectData => {
    const { taskDispatchType } = this.state;
    const {
      purchaseOrderCode,
      purchaseOrder,
      attachments,
      amountProductPlanned,
      amountProductCompleted,
      createdAt,
      createdType,
      projectCode,
      description,
      status,
      managersName,
      plannersName,
    } = projectData || {};
    return (
      <div style={{ borderTop: `1px dashed ${border}`, paddingTop: 20 }}>
        <Row>
          <Col type={'title'}>销售订单</Col>
          <Col type={'content'}>
            {purchaseOrderCode ? <Tooltip text={purchaseOrderCode} length={20} /> : replaceSign}
          </Col>
          <Col type={'title'}>生产主管</Col>
          <Col type={'content'}>{managersName ? <Tooltip text={managersName} length={20} /> : replaceSign}</Col>
          {taskDispatchType === TASK_DISPATCH_TYPE.workerWeak ? null : (
            <React.Fragment>
              <Col type={'title'}>工艺路线</Col>
              <Col type={'content'}>{getCraftType(projectData)}</Col>
            </React.Fragment>
          )}
        </Row>
        <Row>
          <Col type={'title'}>采购进度</Col>
          <Col type={'content'}>
            {projectCode && createdType !== 'processRouting' ? (
              <span
                style={{ color: primary, cursor: 'pointer' }}
                onClick={async () => {
                  const res = await getPurchaseProgress({ projectCode });
                  const { data } = res || {};
                  const { data: purchaseListMaterialList } = data || {};

                  this.setState({
                    modalVisible: true,
                    modalData: { data: purchaseListMaterialList },
                  });
                }}
              >
                查看
              </span>
            ) : (
              replaceSign
            )}
          </Col>
          <Col type={'title'}>创建时间</Col>
          <Col type={'content'}>{createdAt ? `${moment(createdAt).format('YYYY/MM/DD HH:mm:ss')}` : replaceSign}</Col>
          {taskDispatchType === TASK_DISPATCH_TYPE.manager && [
            <Col type={'title'}>计划员</Col>,
            <Col type={'content'}>{plannersName ? <Tooltip text={plannersName} length={20} /> : replaceSign}</Col>,
          ]}
        </Row>
        <Row>
          <Col type={'title'}>订单备注</Col>
          <Col type={'content'} style={{ width: 500 }}>
            {purchaseOrder ? purchaseOrder.remark || replaceSign : replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>项目备注</Col>
          <Col type={'content'} style={{ width: 500 }}>
            {description || replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>附件</Col>
          <Col type={'content'}>
            {Array.isArray(attachments) && attachments.length > 0 ? (
              <AttachmentView hideTitle files={attachments} />
            ) : (
              replaceSign
            )}
          </Col>
        </Row>
        {this.renderSwitch('close')}
      </div>
    );
  };

  renderDetailInfo = () => {
    const { projectData, fetchProjectData } = this.props;
    const { taskDispatchType, projectBatchRecordUrl } = this.state;

    const {
      product,
      purchaseOrder,
      managers,
      attachments,
      amountProductPlanned,
      amountProductCompleted,
      createdAt,
      createdType,
      projectCode,
      description,
      planners,
      productBatch,
      productBatchType,
      productBatchNumberRule,
      category,
      status: _projectStatus,
      batchRecordAuditStatus,
    } = projectData || {};
    const projectStatus = _.get(_projectStatus, 'status');
    const _attachments =
      Array.isArray(attachments) && attachments.length > 0
        ? attachments.map(a => {
            const { original_extension, original_filename, uri, id } = a;
            return {
              id,
              originalExtension: original_extension,
              originalFileName: original_filename,
              url: uri,
            };
          })
        : null;

    const { purchaseOrderCode } = purchaseOrder || {};
    const { unit, desc } = product || {};
    const managersName = Array.isArray(managers) ? managers.map(({ name }) => name).join(' ') : null;
    const plannersName = Array.isArray(planners) ? planners.map(i => i && i.name).join(' ') : null;

    if (Number(category) === 2) {
      return this.renderBaitingDetailInfo({
        ...projectData,
        attachments: _attachments,
        purchaseOrderCode,
        managersName,
        plannersName,
      });
    }

    return (
      <div style={{ borderTop: `1px dashed ${border}`, paddingTop: 20 }}>
        <Row>
          <Col type={'title'}>销售订单</Col>
          <Col type={'content'}>
            {purchaseOrderCode ? <Tooltip text={purchaseOrderCode} length={20} /> : replaceSign}
          </Col>
          <Col type={'title'}>生产主管</Col>
          <Col type={'content'}>{managersName ? <Tooltip text={managersName} length={20} /> : replaceSign}</Col>
          {taskDispatchType === TASK_DISPATCH_TYPE.workerWeak ? null : (
            <React.Fragment>
              <Col type={'title'}>工艺</Col>
              <Col type={'content'}>{getCraftType(projectData)}</Col>
            </React.Fragment>
          )}
        </Row>
        <Row>
          <Col type={'title'}>进度</Col>
          <Col type={'content'}>
            {amountProductCompleted >= 0 && amountProductPlanned > 0 ? (
              <Tooltip
                text={`${thousandBitSeparator(amountProductCompleted)}/${thousandBitSeparator(
                  amountProductPlanned,
                )} ${unit || replaceSign}`}
                length={20}
              />
            ) : null}
          </Col>
          <Col type={'title'}>采购进度</Col>
          <Col type={'content'}>
            {projectCode && createdType !== 'processRouting' ? (
              <Link
                onClick={async () => {
                  const res = await getPurchaseProgress({ projectCode });
                  const { data } = res || {};
                  const { data: purchaseListMaterialList } = data || {};

                  this.setState({
                    modalVisible: true,
                    modalData: { data: purchaseListMaterialList },
                  });
                }}
              >
                查看
              </Link>
            ) : (
              replaceSign
            )}
          </Col>
          <Col type={'title'}>创建时间</Col>
          <Col type={'content'}>{createdAt ? `${moment(createdAt).format('YYYY/MM/DD HH:mm:ss')}` : replaceSign}</Col>
        </Row>
        <Row>
          {taskDispatchType === TASK_DISPATCH_TYPE.manager && [
            <Col type={'title'}>计划员</Col>,
            <Col type={'content'}>{plannersName ? <Tooltip text={plannersName} length={20} /> : replaceSign}</Col>,
          ]}
        </Row>
        <Row>
          {includeOrganizationConfig(ORGANIZATION_CONFIG.SOPConfig) &&
          includeOrganizationConfig(ORGANIZATION_CONFIG.BatchRecord) &&
          projectCode ? (
            <React.Fragment>
              <Col type="title">批记录</Col>
              <Col type="content" style={{ display: 'flex' }}>
                {[PROJECT_STATUS_EXECUTING, PROJECT_STATUS_SUSPENDING, PROJECT_STATUS_FINISHED].includes(
                  projectStatus,
                ) && includeOrganizationConfig(ORGANIZATION_CONFIG.ProjectBatchRecordAudit) ? (
                  <React.Fragment>
                    <span style={baseLinkStyle}>
                      {projectBatchRecordAuditStatusMap[batchRecordAuditStatus && batchRecordAuditStatus.status]}
                    </span>
                    {[BATCH_RECORD_STATUS_UNSTARTED, BATCH_RECORD_STATUS_FAILED].includes(
                      batchRecordAuditStatus && batchRecordAuditStatus.status,
                    ) ? (
                      <BatchRecordAuditLink
                        refetchData={fetchProjectData}
                        params={{ projectCode }}
                        style={baseLinkStyle}
                      />
                    ) : null}
                    {[PROJECT_STATUS_CANCELED, PROJECT_STATUS_UNSTARTED].includes(projectStatus) ||
                    [BATCH_RECORD_STATUS_UNSTARTED, BATCH_RECORD_STATUS_FAILED].includes(
                      batchRecordAuditStatus && batchRecordAuditStatus.status,
                    ) ? null : (
                      <BatchRecordAuditProcess
                        refetchData={fetchProjectData}
                        params={{ projectCode }}
                        style={baseLinkStyle}
                      />
                    )}
                  </React.Fragment>
                ) : null}
                <Link
                  style={baseLinkStyle}
                  onClick={() => {
                    getBatchTemplateByName('项目批记录')
                      .then(res => {
                        let href = _.get(res, 'data.data.templateUrl', '');
                        const encode_unit = unit ? encodeURIComponent(encodeURIComponent(unit)) : '[unit]';
                        const project_code = projectCode ? encodeURIComponent(projectCode) : '[project_code]';
                        href = _.replace(href, '[unit]', encode_unit);
                        href = _.replace(href, '[project_code]', project_code);
                        if (href) {
                          window.open(href, '_blank');
                        }
                      })
                      .catch(err => log.error(err));
                  }}
                >
                  查看批记录
                </Link>
              </Col>
            </React.Fragment>
          ) : null}
        </Row>
        <Row>
          <Col type={'title'}>物料规格</Col>
          <Col type={'content'} style={{ width: 500 }}>
            {desc || replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>订单备注</Col>
          <Col type={'content'} style={{ width: 500 }}>
            {purchaseOrder ? purchaseOrder.remark || replaceSign : replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>项目备注</Col>
          <Col type={'content'} style={{ width: 500 }}>
            {description || replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>附件</Col>
          <Col type={'content'}>
            {Array.isArray(_attachments) && _attachments.length > 0 ? (
              <AttachmentView hideTitle files={_attachments} />
            ) : (
              replaceSign
            )}
          </Col>
        </Row>
        <Row>
          <Col type={'title'}>成品批次</Col>
          <Col type={'content'} style={{ width: 500 }}>
            <div>
              {this.renderProductBatch(productBatchType, productBatch, productBatchNumberRule)}
              {/* {status &&
                status.status === 1 && (
                  <span
                    style={{ marginLeft: 10, color: primary, cursor: 'pointer' }}
                    onClick={() => {
                      openModal({
                        title: '编辑规则',
                        children: (
                          <UpdateProjectProductBatchCodeRule
                            projectCode={projectCode}
                            cbForUpdateSuccess={fetchProjectData}
                            initialData={productBatchNumberRule}
                          />
                        ),
                        footer: null,
                      });
                    }}
                  >
                    编辑
                  </span>
                )} */}
            </div>
          </Col>
        </Row>
        {this.renderSwitch('close')}
      </div>
    );
  };

  renderSwitch = action => {
    const { changeChineseToLocale } = this.context;
    return (
      <div
        style={{ cursor: 'pointer' }}
        onClick={() => {
          this.setState({ showDetail: action === 'open' });
          this.props.onSwitchClick(action === 'open');
        }}
        className={classNames(action === 'open' && styles.closedArrow)}
      >
        <div style={{ textAlign: 'center', color: primary }}>
          {action === 'open' ? changeChineseToLocale('展开') : changeChineseToLocale('收起')}
        </div>
        <div>
          <Icon type={action === 'open' ? 'down' : 'up'} style={{ margin: 'auto', display: 'block', color: primary }} />
        </div>
      </div>
    );
  };

  renderPurchaseProgressModal = () => {
    const { modalVisible, modalData } = this.state;

    return (
      <PurchaseListProgressModal
        onVisibleChange={visible => {
          this.setState({ modalVisible: visible });
        }}
        data={modalData}
        visible={modalVisible}
      />
    );
  };

  renderProductBatch = (type, productBatch, rule) => {
    if (type === 1) return productBatch;
    if (type === 2) return `规则 ${_.get(rule, 'ruleName', replaceSign)}`;
    return replaceSign;
  };

  render() {
    const { showDetail } = this.state;

    return (
      <div style={{ borderBottom: `1px solid ${border}`, position: 'relative' }}>
        {this.renderBasicInfo()}
        {showDetail ? this.renderDetailInfo() : this.renderSwitch('open')}
        {this.renderPurchaseProgressModal()}
      </div>
    );
  }
}

DetailCard.contextTypes = {
  changeChineseToLocale: () => {},
};

export default DetailCard;
