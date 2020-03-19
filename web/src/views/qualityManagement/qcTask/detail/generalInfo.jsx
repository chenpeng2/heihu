import React, { Component } from 'react';
import _ from 'lodash';
import { Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { download, wrapUrl } from 'utils/attachment';
import { getAttachments } from 'src/services/attachment';
import {
  Attachment,
  withForm,
  Row,
  Col,
  Spin,
  message,
  FormItem,
  Link,
  DetailPageItemContainer,
  Text,
} from 'components';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { updateQcTaskAttachments } from 'src/services/qualityManagement/qcTask';
import { formatUnix } from 'utils/time';
import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'src/utils/array';
import { qcTaskStatusMap, INPUT_FACTORY_QC, OUTPUT_FACTORY_QC } from '../../constants';
import { qcReportAuditConfigIsTrue } from '../../utils';
import styles from './styles.scss';

type Props = {
  form: {
    getFieldDecorator: () => {},
    setFieldsValue: () => {},
    getFieldValue: () => {},
  },
  intl: any,
  match: {},
  data: {},
};

const colStyle = { width: 400 };

export const getActualTime = (plan, real, intl) => {
  if (!plan && !real) {
    return replaceSign;
  }
  const planTime = plan ? formatUnix(plan) : replaceSign;
  const realTime = real ? formatUnix(real) : replaceSign;
  return `${realTime}（${changeChineseToLocale('计划', intl)}：${planTime}）`;
};

class GeneralInfo extends Component {
  props: Props;
  state = {
    data: {},
    attachments: [],
    loading: false,
    needUpdate: false,
    deletFlag: false,
  };

  componentWillReceiveProps(nextProps) {
    const { data: old_data } = this.props;
    const { data } = nextProps;
    const { attachmentIds } = data || {};
    if (old_data.code !== data.code && attachmentIds && attachmentIds.length) {
      this.fetchAttachmentsData(attachmentIds);
    }
  }

  updateQcTaskAttachments = async (files, action) => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    const ids = files && files.map(({ id }) => id);
    await updateQcTaskAttachments(id, ids).then(data => {
      if (action === 'delete') {
        message.success('删除附件成功');
        return;
      }
      if (data) {
        message.success('上传附件成功');
      }
    });
  };

  fetchAttachmentsData = async ids => {
    const {
      form: { setFieldsValue },
    } = this.props;
    const {
      data: { data },
    } = await getAttachments(ids);
    const attachments = data.map(x => {
      x.id = x.id;
      x.originalFileName = x.original_filename;
      x.originalExtension = x.original_extension;
      return x;
    });
    setFieldsValue({ attachmentIds: attachments });
  };

  onDeleteAttachment = ({ name, response }) => {
    let files = this.props.form.getFieldValue('attachmentIds');
    const {
      data: { id: restId },
    } = response;
    Modal.confirm({
      iconType: 'exclamation-circle',
      className: `${styles.deleteModal}`,
      title: '是否删除？',
      content: `确定删除${name}吗？`,
      okText: '确定删除',
      cancelText: '暂不删除',
      onOk: () => {
        files = files.filter(({ id }) => id !== restId);
        this.props.form.setFieldsValue({
          attachmentIds: files,
        });
        this.updateQcTaskAttachments(files, 'delete');
      },
    });
    return false;
  };

  renderQcReportAuditFields = ({ auditorName, auditedTime }) => {
    const qcReportAuditConfig = qcReportAuditConfigIsTrue();
    if (!qcReportAuditConfig) return null;

    return (
      <React.Fragment>
        <Row>
          <Col type="title">审核人</Col>
          <Col type="content" style={colStyle}>
            {auditorName || replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type="title">审核时间</Col>
          <Col type="content" style={colStyle}>
            {auditedTime ? formatUnix(auditedTime) : replaceSign}
          </Col>
        </Row>
      </React.Fragment>
    );
  };

  renderInfo = data => {
    const {
      form: { getFieldDecorator },
      intl,
    } = this.props;
    const {
      status,
      task,
      auditedTime,
      auditorName,
      plannedStartTime,
      startTime,
      operatorName,
      plannedEndTime,
      endTime,
    } = data || {};
    const { id, processCode, processName, projectCode, purchaseOrderCode, workstationId, operators, taskCode } =
      task || {};

    return (
      <DetailPageItemContainer contentStyle={{ width: '100%', padding: '10px 0' }} itemHeaderTitle="任务信息">
        <Row>
          <Col type="title">任务编号</Col>
          <Col type="content" style={colStyle}>
            {data.code || replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type="title">任务状态</Col>
          <Col type="content" style={colStyle}>
            {typeof status === 'number' ? qcTaskStatusMap[status] : replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type="title">质检位置</Col>
          <Col type="content" style={colStyle}>
            {_.get(data, 'storage.name') || _.get(data, 'workstation.name')}
          </Col>
        </Row>
        <Row>
          <Col type="title">开始时间</Col>
          <Col type="content" style={colStyle}>
            {getActualTime(plannedStartTime, startTime, intl)}
          </Col>
        </Row>
        <Row>
          <Col type="title">质检人员</Col>
          <Col type="content" style={colStyle}>
            {operatorName || replaceSign}
          </Col>
        </Row>
        <Row>
          <Col type="title">结束时间</Col>
          <Col type="content" style={colStyle}>
            {getActualTime(plannedEndTime, endTime, intl)}
          </Col>
        </Row>
        {data.checkType === INPUT_FACTORY_QC || data.checkType === OUTPUT_FACTORY_QC ? null : (
          <React.Fragment>
            <Row>
              <Col type="title">生产工序</Col>
              <Col type="content" style={colStyle}>
                {processCode ? (
                  <Link
                    onClick={() => {
                      this.context.router.history.push(`/bom/newProcess/${processCode}/detail`);
                    }}
                  >
                    {`${processCode}/${processName}`}
                  </Link>
                ) : (
                  replaceSign
                )}
              </Col>
            </Row>
            <Row>
              <Col type="title">生产工位</Col>
              <Col type="content" style={colStyle}>
                {processCode ? (
                  <Link
                    onClick={() => {
                      this.context.router.history.push(
                        `/knowledgeManagement/workstation/detail/${workstationId}?from=/knowledgeManagement/workstation`,
                      );
                    }}
                  >
                    {_.get(task, 'workstation.name')}
                  </Link>
                ) : (
                  replaceSign
                )}
              </Col>
            </Row>
            <Row>
              <Col type="title">生产任务号</Col>
              <Col type="content" style={colStyle}>
                {taskCode ? (
                  <Link
                    onClick={() => {
                      this.context.router.history.push(`/cooperate/prodTasks/detail/${id}`);
                    }}
                  >
                    {taskCode}
                  </Link>
                ) : (
                  replaceSign
                )}
              </Col>
            </Row>
            <Row>
              <Col type="title">项目号</Col>
              <Col type="content" style={colStyle}>
                {projectCode ? (
                  <Link
                    onClick={() => {
                      this.context.router.history.push(`/cooperate/projects/${projectCode}/detail`);
                    }}
                  >
                    {projectCode}
                  </Link>
                ) : (
                  replaceSign
                )}
              </Col>
            </Row>
            <Row>
              <Col type="title">生产人员</Col>
              <Col type="content" style={colStyle}>
                {!arrayIsEmpty(operators) ? operators.map(n => n.name) : replaceSign}
              </Col>
            </Row>
            <Row>
              <Col type="title">订单号</Col>
              <Col type="content" style={colStyle}>
                {purchaseOrderCode ? (
                  <Link
                    onClick={() => {
                      this.context.router.history.push(`/cooperate/purchaseOrders/${purchaseOrderCode}/detail`);
                    }}
                  >
                    {purchaseOrderCode}
                  </Link>
                ) : (
                  replaceSign
                )}
              </Col>
            </Row>
          </React.Fragment>
        )}
        {this.renderQcReportAuditFields({
          auditedTime,
          auditorName,
        })}
        <Row>
          <Col type="title">附件</Col>
          <Col type="content" style={{ width: 820 }}>
            <FormItem label="">
              {getFieldDecorator('attachmentIds', {})(
                <Attachment
                  rest
                  multiple
                  maskClosable
                  maxSize="100"
                  onUpload={this.updateQcTaskAttachments}
                  onPreview={file => {
                    const id = _.get(file, 'response.data.id');
                    download(wrapUrl(id), file.name);
                  }}
                  onRemove={this.onDeleteAttachment}
                />,
              )}
            </FormItem>
          </Col>
        </Row>
      </DetailPageItemContainer>
    );
  };

  // 0.单体记录, 1.质检项记录, 2.仅记录次品
  render() {
    const { loading } = this.state;
    const { data } = this.props;

    return <Spin spinning={loading}>{this.renderInfo(data)}</Spin>;
  }
}

GeneralInfo.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withForm({}, withRouter(injectIntl(GeneralInfo)));
