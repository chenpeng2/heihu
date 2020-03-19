import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { message, Row, Col, withForm, Link } from 'components';
import { replaceSign, PROJECT_CATEGORY_INJECTION_MOULDING } from 'constants';
import { TASK_DISPATCH_TYPE } from 'utils/organizationConfig';
import { arrayIsEmpty } from 'utils/array';
import { formatUnix } from 'utils/time';
import { toWorkOrderDetail } from 'views/cooperate/plannedTicket/navigation';
import { toInjectionMouldingProjectDetail } from 'views/cooperate/navigation';
import { effects, actions } from 'store/quality';
import { fetchCustomRuleData } from 'src/views/qualityManagement/utils';
import { connect } from 'react-redux';

import { QcPlanProcessTable, QcPlanButtonFooter, UpdateQcPlanStatusLink } from '../components';
import { getOrganizationTaskDispatchType, formatEditSubmitData } from '../utils';
import {
  QCPLAN_CHECK_TYPE,
  QCPLAN_STATUS,
  QCPLAN_STATUS_DISABLE,
  QCPLAN_STATUS_ENABLE,
  PLAN_WORK_ORDER_CATEGORY,
} from '../../constants';
import { toQcPlanList } from '../../navigation';
import styles from '../styles.scss';

const gapStyle = { marginRight: 10 };

/** 整理质检方案信息 */
const formatQcPlanProcessConfigs = (qcPlanProcessConfigs, processSeq, processCode) => {
  if (arrayIsEmpty(qcPlanProcessConfigs)) return [];

  const _qcPlanProcessConfigs = qcPlanProcessConfigs.map(qcPlanProcessConfig => {
    const {
      id: qcPlanProcessConfigId,
      qcPlanProcessId,
      qcPlanCode,
      orgId,
      createdAt,
      updatedAt,
      qcConfig,
      operatorId,
      operatorName,
      workstation,
      ...rest
    } = qcPlanProcessConfig;

    const _workstation = workstation ? { key: workstation.id, label: workstation.name } : undefined;
    const _operator = operatorId ? { key: operatorId, label: operatorName } : undefined;

    const {
      attachmentDetails,
      qcCheckItemConfigs,
      id,
      code,
      name,
      checkCountType,
      checkCount,
      recordType,
      scrapInspection,
    } = qcConfig || {};

    return {
      ...rest,
      key: `${qcPlanProcessId}-${id}`,
      attachmentDetails,
      qcCheckItemConfigs,
      id, // qcConfigId
      code,
      name,
      checkCountType,
      checkCount,
      recordType,
      scrapInspection,
      workstation: _workstation,
      operator: _operator,
      processCode,
    };
  });
  return _qcPlanProcessConfigs;
};

/** 将后端返回的工序信息整理成页面渲染的数据结构 */
const formatQcPlanProcesses = qcPlanProcesses => {
  if (!arrayIsEmpty(qcPlanProcesses)) {
    return qcPlanProcesses.map(process => {
      const {
        id,
        material,
        controlLevel,
        noPassStatuses,
        plannedAmount,
        processCode,
        processName,
        processSeq,
        qcPlanProcessConfigs,
      } = process;

      return {
        id,
        material,
        controlLevel,
        noPassStatuses,
        plannedAmount,
        processCode,
        processName,
        processSeq,
        qcPlanProcessConfigs: formatQcPlanProcessConfigs(qcPlanProcessConfigs, processSeq, processCode),
      };
    });
  }
  return [];
};

type Props = {
  planDetail: any,
  customRuleList: [],
};

/** 编辑质检计划 */
class EditQcPlan extends Component {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      qcPlanProcesses: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.fetchQcPlanData();
    fetchCustomRuleData();
  }

  componentWillUnmount() {
    actions.updatePlanDetail(null);
  }

  setQcPlanProcessList = qcPlanProcesses => {
    if (!arrayIsEmpty(qcPlanProcesses)) {
      const _qcPlanProcesses = formatQcPlanProcesses(qcPlanProcesses);
      this.setState({ qcPlanProcesses: _qcPlanProcesses });
      this.QcPlanProcessTableRef.setInitialData(_qcPlanProcesses);
    }
  };

  fetchQcPlanData = async () => {
    const code = _.get(this.props.match, 'params.code');
    try {
      const planDetail = await effects.getDetailInfo(code);
      actions.updatePlanDetail(planDetail);
      const qcPlanProcesses = _.get(planDetail, 'qcPlanProcesses');
      const _qcPlanProcesses = _.sortBy(qcPlanProcesses, o => Number(o.processSeq));
      this.setQcPlanProcessList(_qcPlanProcesses);
    } catch (error) {
      console.log(error);
    }
  };

  onSubmit = async () => {
    try {
      await this.QcPlanProcessTableRef.handleExtraTagClick();
    } catch (error) {
      return;
    }
    const { qcPlanProcesses: initialProcessData } = this.state;
    const { planDetail } = this.props;
    const { changeChineseToLocale } = this.context;
    const { qcPlanProcesses } = this.props.form.getFieldsValue() || {};
    const qcPlanCode = _.get(planDetail, 'code');
    let _qcPlanProcesses = qcPlanProcesses;
    if (!_qcPlanProcesses) {
      // 没有操作过任何质检方案，直接点保存，则将initialTableData作为表单值提交
      _qcPlanProcesses = initialProcessData;
    }
    const submitData = await formatEditSubmitData({
      initialProcessData,
      qcPlanProcesses: _qcPlanProcesses,
      qcPlanCode,
    });
    const dto = { code: qcPlanCode, ...submitData };
    const data = await effects.editQcPlan(dto);
    const statusCode = _.get(data, 'statusCode');
    if (statusCode === 200) {
      message.success(changeChineseToLocale('编辑成功'));
      this.props.history.push(toQcPlanList());
    } else {
      message.error(changeChineseToLocale('编辑失败'));
    }
  };

  render() {
    const { form, customRuleList } = this.props;
    const { getFieldDecorator } = form || {};
    const dispatchType = getOrganizationTaskDispatchType();
    const { loading, qcPlanProcesses } = this.state;
    const { planDetail } = this.props;
    const { changeChineseToLocale } = this.context;
    if (_.isEmpty(planDetail)) return null;

    const {
      checkType,
      code: qcPlanCode,
      project,
      planWorkOrder,
      status,
      createdAt,
      creatorName,
      updatedAt,
      projectCode,
    } = planDetail;
    const planWorkOrderCode = _.get(planWorkOrder, 'code');
    const planWorkOrderCategory = _.get(planWorkOrder, 'category');
    const projectCategory = _.get(project, 'category');
    const projectPath =
      PROJECT_CATEGORY_INJECTION_MOULDING === projectCategory
        ? toInjectionMouldingProjectDetail({ code: projectCode })
        : `/cooperate/projects/${encodeURIComponent(projectCode)}/detail`;
    const isInjectionMouldingChild = planWorkOrderCategory === PLAN_WORK_ORDER_CATEGORY.injectMold.id;
    const category = planWorkOrderCategory === PLAN_WORK_ORDER_CATEGORY.injectMold.id ? null : planWorkOrderCategory;
    const workOrderDetailPath = toWorkOrderDetail({ code: planWorkOrderCode, category, isInjectionMouldingChild });

    return (
      <div className={styles.editPlan}>
        <p>{changeChineseToLocale('编辑质检计划')}</p>
        <div>
          <Row>
            <Row>
              <Col type="title">{changeChineseToLocale('编号')}</Col>
              <Col type="content">{qcPlanCode || replaceSign}</Col>
            </Row>
            <Row>
              <Col type="title">{changeChineseToLocale('计划类型')}</Col>
              <Col type="content">{QCPLAN_CHECK_TYPE[checkType] || replaceSign}</Col>
            </Row>
            {dispatchType === TASK_DISPATCH_TYPE.manager ? (
              <Row>
                <Col type="title">{changeChineseToLocale('计划工单编号')}</Col>
                <Col type="content">
                  {planWorkOrderCode ? (
                    <Link.NewTagLink href={workOrderDetailPath}>{planWorkOrderCode}</Link.NewTagLink>
                  ) : (
                    replaceSign
                  )}
                </Col>
              </Row>
            ) : (
              <Row>
                <Col type="title">{changeChineseToLocale('项目')}</Col>
                <Col type="content">
                  {projectCode ? <Link.NewTagLink href={projectPath}>{projectCode}</Link.NewTagLink> : replaceSign}
                </Col>
              </Row>
            )}
          </Row>
          <Row>
            <Row>
              <Col type="title">{changeChineseToLocale('状态')}</Col>
              <Col type="content">
                <span style={gapStyle}>{changeChineseToLocale(QCPLAN_STATUS[status].display)}</span>
                <UpdateQcPlanStatusLink
                  refetchData={this.fetchQcPlanData}
                  params={{
                    status: status === QCPLAN_STATUS_DISABLE ? QCPLAN_STATUS_ENABLE : QCPLAN_STATUS_DISABLE,
                    code: qcPlanCode,
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col type="title">{changeChineseToLocale('创建人')}</Col>
              <Col type="content">{creatorName || replaceSign}</Col>
            </Row>
            <Row>
              <Col type="title">{changeChineseToLocale('创建时间')}</Col>
              <Col type="content">{createdAt ? formatUnix(createdAt) : replaceSign}</Col>
            </Row>
          </Row>
          <Row>
            <Row>
              <Col type="title">{changeChineseToLocale('更新时间')}</Col>
              <Col type="content">{updatedAt ? formatUnix(updatedAt) : replaceSign}</Col>
            </Row>
          </Row>
        </div>
        {getFieldDecorator('qcPlanProcesses')(
          <QcPlanProcessTable
            editing
            checkType={checkType}
            form={form}
            loading={loading}
            qcPlanProcesses={qcPlanProcesses}
            customRuleList={customRuleList}
            ref={e => (this.QcPlanProcessTableRef = e)}
          />,
        )}
        <QcPlanButtonFooter submit={this.onSubmit} />
      </div>
    );
  }
}

EditQcPlan.propTypes = {
  history: PropTypes.any,
  match: PropTypes.any,
  form: PropTypes.any,
};

EditQcPlan.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

const FormWrapper = withForm({}, EditQcPlan);

const mapState = state => {
  const { planDetail } = _.get(state, 'quality.plan');
  const customRuleList = _.get(state, 'organizationConfig.customRuleList');
  return { planDetail, customRuleList };
};

const mapDispatch = () => ({});

export default connect(
  mapState,
  mapDispatch,
)(FormWrapper);
