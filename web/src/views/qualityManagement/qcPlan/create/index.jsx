import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { message, withForm, Searchselect, FormItem, Input } from 'components';
import { TASK_DISPATCH_TYPE } from 'src/utils/organizationConfig';
import { replaceSign } from 'src/constants';
import { getState } from 'src/routes/getRouteParams';
import { arrayIsEmpty } from 'utils/array';
import { getInjectWorkOrderConfig } from 'utils/organizationConfig';
import { createQcPlan } from 'src/services/qualityManagement/qcPlan';
import { PLAN_STATUS_SCHEDULED } from 'src/views/cooperate/plannedTicket/utils';
import { queryWorkOrderProcessInfoList } from 'src/services/cooperate/plannedTicket';
import { fetchCustomRuleData } from 'src/views/qualityManagement/utils';

import { RadioItem } from '../components/Form';
import { QcPlanProcessTable, QcPlanButtonFooter } from '../components';
import { formatCreateSubmitData, getOrganizationTaskDispatchType } from '../utils';
import { invisibleStyle } from '../../constants';
import { toQcPlanList } from '../../navigation';
import styles from '../styles.scss';

const injectMoldEnabled = getInjectWorkOrderConfig();
const workOrderTypeId = 'workOrderType';
const workOrderType = {
  general: {
    value: 1,
    label: '普通工单',
  },
  injectMold: {
    value: 3,
    label: '注塑工单',
  },
};

/** 查询指定计划工单工艺上存的工序信息 */
const fetchPlanWorkOrderProcessList = async planWorkOrderCode => {
  if (!planWorkOrderCode) {
    throw new Error('empty planWorkOrderCode!');
  }
  try {
    const res = await queryWorkOrderProcessInfoList(planWorkOrderCode);
    const processList = _.get(res, 'data.data');
    return processList;
  } catch (error) {
    throw error;
  }
};

/** 整理质检方案信息 */
const formatQcPlanProcessConfigs = ({ qcConfigDetails, processSeq, workstations, checkType }) => {
  if (arrayIsEmpty(qcConfigDetails)) return null;

  /** 将不是该质检计划类型的质检方案过滤掉 */
  const _qcConfigDetails = qcConfigDetails.filter(x => x && x.checkType === Number(checkType));

  if (arrayIsEmpty(_qcConfigDetails)) return null;

  const qcPlanProcessConfigs = _qcConfigDetails.map(detail => {
    const {
      id,
      code,
      name,
      autoCreateQcTask,
      checkCount,
      checkCountType,
      checkType,
      taskCreateType,
      taskCreateInterval,
      taskCreateCount,
      taskCreateCountAll,
      attachments,
      scrapInspection,
      qcCheckItemConfigs,
      recordType,
    } = detail;
    const workstation = !arrayIsEmpty(workstations) ? { key: workstations[0], label: undefined } : undefined;

    return {
      id,
      autoCreateQcTask,
      checkCount,
      checkCountType,
      checkType,
      taskCreateType,
      taskCreateInterval,
      taskCreateCount,
      taskCreateCountAll,
      attachments,
      scrapInspection,
      qcCheckItemConfigs,
      recordType,
      code,
      name,
      /** 同一工序上不能配重复的质检方案，不同工序上可以配相同的质检方案  */
      key: `${processSeq}-${id}`,
      /** 质检工位默认为工序对应的工位，若有多个则默认第一个 */
      workstation,
      workstationId: workstations && workstations[0],
    };
  });

  return qcPlanProcessConfigs;
};

/** 将计划工单上查询到的工序信息格式化成质检计划需要的数据结构 */
const formatProcessList = ({ qcPlanProcesses, checkType }) => {
  const { processInfoList } = qcPlanProcesses || {};
  if (arrayIsEmpty(processInfoList)) return [];
  return _.sortBy(processInfoList, 'processSeq').map(processInfo => {
    const {
      id,
      outputMaterials,
      denominator,
      qcConfigDetails,
      processCode,
      processName,
      processSeq,
      workstations,
    } = processInfo;
    const qcPlanProcessConfigs = formatQcPlanProcessConfigs({ qcConfigDetails, workstations, processSeq, checkType });
    return {
      id,
      processCode,
      processName,
      processSeq,
      material: _.get(outputMaterials, 'material'),
      plannedAmount: denominator,
      qcPlanProcessConfigs,
      workstations,
    };
  });
};

/** 工单类型 */
const WorkOrderItem = (props, context) => {
  const { form, onChange } = props;
  const { changeChineseToLocale } = context;
  const fieldOptions = { initialValue: workOrderType.general.value, onChange };
  const radioOptions = [
    { label: changeChineseToLocale(workOrderType.general.label), value: workOrderType.general.value },
    { label: changeChineseToLocale(workOrderType.injectMold.label), value: workOrderType.injectMold.value },
  ];

  return (
    <RadioItem
      label="工单类型"
      fieldId={workOrderTypeId}
      fieldOptions={fieldOptions}
      radioOptions={radioOptions}
      form={form}
      required
    />
  );
};

WorkOrderItem.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

/** 创建质检计划 */
class CreateQcPlan extends Component {
  planWorkOrderCode;
  /** 工单类型 */
  planWorkOrderCategory = workOrderType.general.value;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      /** 质检计划工序列表 */
      qcPlanProcesses: [],
      /** 质检计划类型 */
      checkType: {},
      orderTypeChanged: false,
    };
  }

  componentDidMount() {
    const state = getState(this.props.match);
    const { checkType } = state || {};
    fetchCustomRuleData();
    this.setState({ checkType });
  }

  onPlanWorkOrderChange = async v => {
    this.planWorkOrderCode = _.get(v, 'key');
    this.getProcessList();
    this.setState({ orderTypeChanged: false });
  };

  onChangeWorkOrderType = e => {
    this.planWorkOrderCategory = _.get(e, 'target.value');
    this.setState({ qcPlanProcesses: [], orderTypeChanged: true });
    this.QcPlanProcessTableRef.setInitialData([]);
    const { form } = this.props;
    form.resetFields(['planWorkOrderCode']);
  };

  getProcessList = async () => {
    try {
      const processList = await fetchPlanWorkOrderProcessList(this.planWorkOrderCode);
      this.setQcPlanProcesses(processList);
    } catch (error) {
      console.log(error);
    }
  };

  setQcPlanProcesses = qcPlanProcesses => {
    const checkType = _.get(this.state, 'checkType.value');
    const _qcPlanProcesses = formatProcessList({ qcPlanProcesses, checkType });
    this.setState({ qcPlanProcesses: _qcPlanProcesses });
    this.QcPlanProcessTableRef.setInitialData(_qcPlanProcesses);
  };

  onSubmit = async () => {
    const { changeChineseToLocale } = this.context;
    try {
      await this.QcPlanProcessTableRef.handleExtraTagClick();
    } catch (error) {
      return;
    }
    const { qcPlanProcesses: initialProcessData } = this.state;
    const { form } = this.props;
    const { qcPlanProcesses, ...rest } = form.getFieldsValue() || {};
    let _qcPlanProcesses = qcPlanProcesses;
    if (_.isEmpty(_qcPlanProcesses)) {
      // 没有操作过任何质检方案，直接点保存，则将initialTableData作为表单值提交
      _qcPlanProcesses = initialProcessData;
    }
    form.validateFieldsAndScroll(errors => {
      if (errors) return;

      const submitData = formatCreateSubmitData({
        qcPlanProcesses: _qcPlanProcesses,
        qcPlanData: rest,
        planWorkOrderCategory: this.planWorkOrderCategory,
      });
      createQcPlan(submitData)
        .then(res => {
          const statusCode = _.get(res, 'data.statusCode');
          if (statusCode === 200) {
            message.success(changeChineseToLocale('创建成功'));
            this.props.history.push(toQcPlanList());
          } else {
            message.error(changeChineseToLocale('创建失败'));
          }
        })
        .catch(err => console.log(err));
    });
  };

  renderWorkOrder = () => {
    const { form } = this.props;
    if (!injectMoldEnabled) return null;
    return <WorkOrderItem form={form} onChange={this.onChangeWorkOrderType} />;
  };

  onConvertPlanWorkerList = data => {
    if (!Array.isArray(data)) return [];
    let selectData = [];
    if (this.planWorkOrderCategory === workOrderType.injectMold.value) {
      data.forEach(order => {
        const subPlanWorders = _.get(order, 'subs', []);
        if (Array.isArray(subPlanWorders)) {
          subPlanWorders.forEach(subOrder => {
            const orderCode = _.get(subOrder, 'workOrderCode', null);
            if (orderCode) {
              selectData.push({ key: orderCode, label: orderCode });
            }
          });
        }
      });
    } else {
      selectData = data.map(({ code }) => ({ key: code, label: code }));
    }
    return selectData;
  };

  render() {
    const { form, customRuleList } = this.props;
    const { getFieldDecorator } = form;
    const { qcPlanProcesses, loading, checkType, orderTypeChanged } = this.state;
    const dispatchType = getOrganizationTaskDispatchType();
    const { changeChineseToLocale } = this.context;

    /** 工人管控的工厂没有创建质检计划入口 */
    if (dispatchType !== TASK_DISPATCH_TYPE.manager) {
      return null;
    }
    const checkTypeOptions = { initialValue: _.get(checkType, 'value', null) };
    const planWorkOrderCodeOptions = {
      rules: [{ required: true, message: changeChineseToLocale('计划工单必填') }],
    };
    const selectParams = { status: PLAN_STATUS_SCHEDULED, size: 100, category: this.planWorkOrderCategory };

    return (
      <div className={styles.createPlan}>
        <p>{changeChineseToLocale('创建质检计划')}</p>
        <div className={styles.top}>
          <FormItem style={invisibleStyle}>{getFieldDecorator('checkType', checkTypeOptions)(<Input />)}</FormItem>
          <FormItem label={changeChineseToLocale('计划类型')}>
            {checkType ? changeChineseToLocale(checkType.display) : replaceSign}
          </FormItem>
          {this.renderWorkOrder()}
          <FormItem label={changeChineseToLocale('计划工单编号')}>
            {getFieldDecorator('planWorkOrderCode', planWorkOrderCodeOptions)(
              <Searchselect
                params={selectParams}
                onChange={this.onPlanWorkOrderChange}
                type="plannedTicketList"
                style={{ width: 200 }}
                converter={this.onConvertPlanWorkerList}
                clearOnFocus={orderTypeChanged}
              />,
            )}
          </FormItem>
        </div>
        {getFieldDecorator('qcPlanProcesses')(
          <QcPlanProcessTable
            checkType={checkType && checkType.value}
            form={form}
            loading={loading}
            qcPlanProcesses={qcPlanProcesses}
            ref={e => (this.QcPlanProcessTableRef = e)}
            customRuleList={customRuleList}
          />,
        )}
        <QcPlanButtonFooter submit={this.onSubmit} />
      </div>
    );
  }
}

CreateQcPlan.propTypes = {
  history: PropTypes.any,
  match: PropTypes.any,
  form: PropTypes.any,
};

CreateQcPlan.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

const mapStateToProps = ({ organizationConfig }) => ({
  customRuleList: organizationConfig && organizationConfig.customRuleList,
});

export default connect(mapStateToProps)(withForm({}, CreateQcPlan));
