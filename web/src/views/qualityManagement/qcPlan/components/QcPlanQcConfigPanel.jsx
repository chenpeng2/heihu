import React, { Component } from 'react';
import _ from 'lodash';
import { arrayIsEmpty } from 'utils/array';
import { amountValidator } from 'components/form';
import { error } from 'src/styles/color';
import { withForm, FormItem, Searchselect, Radio, Input, Select, Attachment, Checkbox, InputNumber } from 'components';
import { replaceSign } from 'src/constants';
import { includeOrganizationConfig, isOriginQcNeedMaterialQr, ORGANIZATION_CONFIG } from 'utils/organizationConfig';
import { RULE } from 'src/views/organizationConfig/customRule/utils';
import moment from 'moment';
import PropTypes from 'prop-types';

import QcItemsTable from './QcItemsTable';
import { RadioItem } from './Form';
import {
  CREATE_TYPE_TIMED,
  CREATE_TYPE_QUANTITATIVE,
  CREATE_TYPE_FIXED_COUNT,
  CREATE_TYPE_FIXED_QCCODE_AMOUNT,
  TASK_CREATE_TYPE,
  FULL_CHECK,
  AQL_CHECK,
  CUSTOM_CHECK,
  CHECKITEM_CHECK,
  MANUFACTURING_QUALITY_CONTROL,
  CHECKCOUNT_TYPE,
  invisibleStyle,
  RECORD_TYPE,
  FIRST_QUALITY_CONTROL,
  PRODUCE_ORIGIN_QC,
} from '../../constants';
import styles from '../styles.scss';
import { getWorkstationFirstQcWorker } from '../utils';
import { timeUnit } from '../constant';

const Option = Select.Option;
const formItemBaseStyle = { width: 300 };
const AttachmentFile = Attachment.AttachmentFile;
const sameAsProdWorkstationByFirstCheck = RULE.firstCheckLocation.sameAsProdWorkstation.value;
const noWorkstationByFirstCheck = RULE.firstCheckLocation.noWorkstation.value;
const prodOperatorByFirstCheck = RULE.firstCheckOperator.prodOperator.value;
const noOperatorByFirstCheck = RULE.firstCheckOperator.noOperator.value;
const sameAsProdOperatorByFirstCheck = RULE.firstCheckOperator.sameAsProdOperator.value;
const sameAsProdWorkstationByProdCheck = RULE.prodCheckLocation.sameAsProdWorkstation.value;
const noWorkstationByProdCheck = RULE.prodCheckLocation.noWorkstation.value;
const sameAsProdOperatorByProdCheck = RULE.prodCheckOperator.prodOperator.value;
const prodOperatorByProdCheck = RULE.prodCheckOperator.sameAsProdOperator.value;
const noOperatorByProdCheck = RULE.prodCheckOperator.noOperator.value;

const getDurationAndUnit = interval => {
  const minutes = !isNaN(interval) ? moment.duration(interval).asMinutes() : 0;
  const o = { duration: minutes, unit: timeUnit.minutes };
  const remainder = minutes % 60;
  if (remainder === 0) {
    o.duration = minutes / 60;
    o.unit = timeUnit.hour;
  }
  return o;
};

/** 定量生产次数 */
const quantitativeCount = (taskCreateCountAll, taskCreateCount) => {
  let count = taskCreateCountAll ? null : taskCreateCount;
  if (isNaN(count)) return count;

  if (count <= 0) count = null;
  return count;
};

const isQrCodeItemVisible = ({ useQrCode, checkType }) => {
  const visible = useQrCode && checkType === FIRST_QUALITY_CONTROL;
  return visible;
};

/** 需要记录物料二维码配置项 */
const RecordMaterialQrCodeItem = (props, context) => {
  const { form, value, visible } = props;
  const { changeChineseToLocale } = context;
  if (!visible) return null;

  const title = changeChineseToLocale('需要记录物料二维码');
  const fieldOptions = {
    initialValue: typeof value === 'boolean' ? value : isOriginQcNeedMaterialQr(),
    rules: [{ required: true, message: title }],
  };
  const radioOptions = [
    { label: changeChineseToLocale('是'), value: true },
    { label: changeChineseToLocale('否'), value: false },
  ];

  return (
    <FormItem label={title}>
      {form.getFieldDecorator('sampleRecordNeeded', fieldOptions)(
        <Radio.Group style={formItemBaseStyle} options={radioOptions} />,
      )}
    </FormItem>
  );
};

RecordMaterialQrCodeItem.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

/** 质检频次详情 */
const QcFrequencyItemDetail = (props, context) => {
  const { form, config } = props;
  const { changeChineseToLocale } = context;
  const type = form.getFieldValue('taskCreateType');
  const { taskCreateInterval, taskCreateCount, taskCreateCountAll } = config;

  // 定时
  if (type === CREATE_TYPE_TIMED) {
    const durationAndUnit = getDurationAndUnit(taskCreateInterval);
    const hidden = form.getFieldValue('taskCreateType') !== CREATE_TYPE_TIMED;
    const rules = [
      { required: true, message: changeChineseToLocale('时间必填') },
      { validator: amountValidator(null, null, 'integer') },
    ];
    const durationOptions = { initialValue: durationAndUnit.duration, hidden, rules };
    const unitOptions = { initialValue: durationAndUnit.unit, hidden };

    return (
      <span>
        <span style={{ padding: 10 }}>{changeChineseToLocale('每')}</span>
        {form.getFieldDecorator('taskCreateIntervalValue', durationOptions)(<InputNumber />)}{' '}
        {form.getFieldDecorator('taskCreateIntervalUnit', unitOptions)(
          <Select style={{ width: 100 }}>
            <Option value={timeUnit.hour}>{changeChineseToLocale('小时')}</Option>
            <Option value={timeUnit.minutes}>{changeChineseToLocale('分钟')}</Option>
          </Select>,
        )}
        <span style={{ paddingLeft: 10 }}>{changeChineseToLocale('质检一次')}</span>
      </span>
    );
  }

  // 定量
  if (type === CREATE_TYPE_QUANTITATIVE) {
    const count = quantitativeCount(taskCreateCountAll, taskCreateCount);
    const selectAll = form.getFieldValue('taskCreateCountAll');
    let quantitativeRules = [];
    if (!selectAll) {
      const required = form.getFieldValue('autoCreateQcTask');
      quantitativeRules = [
        { required, message: changeChineseToLocale('必须填写数量') },
        { validator: amountValidator(null, null, 'integer') },
      ];
    }
    const onChange = () => {
      setTimeout(() => form.validateFields(['taskCreateCount'], { force: true }));
    };
    const countOptions = { initialValue: count, rules: quantitativeRules };
    const checkAllOptions = { initialValue: taskCreateCountAll, valuePropName: 'checked', onChange };
    const inputDisabled = selectAll === undefined ? taskCreateCountAll : selectAll;

    return (
      <span>
        <span style={{ padding: 10 }}>{changeChineseToLocale('生产')}</span>
        {form.getFieldDecorator('taskCreateCount', countOptions)(<InputNumber disabled={inputDisabled} />)}
        <span style={{ paddingLeft: 10 }}>{changeChineseToLocale('质检一次')}</span>
        <span style={{ paddingLeft: 10 }}>
          {form.getFieldDecorator('taskCreateCountAll', checkAllOptions)(
            <Checkbox style={{ display: 'inline' }}>
              <span>{changeChineseToLocale('全部数量')}</span>
            </Checkbox>,
          )}
        </span>
      </span>
    );
  }

  // 固定次数
  if (type === CREATE_TYPE_FIXED_COUNT) {
    const rules = [
      { required: !form.getFieldValue('taskCreateCountAll'), message: changeChineseToLocale('必须填写数量') },
      { validator: amountValidator(10000, 1, 'integer') },
    ];
    const options = { initialValue: taskCreateCount, rules };

    return (
      <span>
        <span style={{ paddingLeft: 10 }}>
          {form.getFieldDecorator('taskCreateCount', options)(<InputNumber style={{ width: 168 }} />)}
        </span>
        <span style={{ paddingLeft: 10 }}>{changeChineseToLocale('次')}</span>
      </span>
    );
  }

  // 定码
  if (type === CREATE_TYPE_FIXED_QCCODE_AMOUNT) {
    const rules = [
      { required: true, message: changeChineseToLocale('请输入二维码个数') },
      { validator: amountValidator(10000, 1, 'integer') },
    ];
    const options = { initialValue: taskCreateCount, rules };

    return (
      <span>
        <span style={{ paddingLeft: 10 }}>
          {form.getFieldDecorator('taskCreateCount', options)(
            <InputNumber style={{ width: 130 }} placeholder={changeChineseToLocale('请输入')} />,
          )}
        </span>
        <span style={{ paddingLeft: 10 }}>{changeChineseToLocale('个二维码')}</span>
      </span>
    );
  }
  return null;
};

QcFrequencyItemDetail.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

/** 质检频次错误提示 */
const ErrorContent = props => {
  const { form } = props;
  let errorText = form.getFieldError('taskCreateIntervalValue') || form.getFieldError('taskCreateCount');
  const selectAll = form.getFieldValue('taskCreateCountAll');
  if (selectAll) {
    errorText = form.getFieldError('taskCreateIntervalValue');
  }
  if (!errorText) return null;

  return <div style={{ color: error }}>{errorText}</div>;
};

/** 质检频次项 */
const QcFrequencyItem = (props, context) => {
  const { form, config } = props;
  const { changeChineseToLocale } = context;
  const {
    checkType,
    taskCreateType,
    autoCreateQcTask,
    taskCreateInterval,
    taskCreateCount,
    taskCreateCountAll,
  } = config;
  const visible =
    Number(checkType) === MANUFACTURING_QUALITY_CONTROL && (autoCreateQcTask || form.getFieldValue('autoCreateQcTask'));
  if (!visible) return null;

  const rules = [
    { required: form.getFieldValue('autoCreateQcTask'), message: changeChineseToLocale('请选择质检频次') },
  ];
  const taskCreateTypeOptions = {
    initialValue: Number(taskCreateType),
    hidden: checkType !== MANUFACTURING_QUALITY_CONTROL || !form.getFieldValue('autoCreateQcTask'),
    rules,
  };
  const disabled =
    autoCreateQcTask || taskCreateInterval !== null || taskCreateCount !== null || Boolean(taskCreateCountAll);

  return (
    <FormItem label={changeChineseToLocale('质检频次')}>
      {form.getFieldDecorator('taskCreateType', taskCreateTypeOptions)(
        <Select disabled={disabled} style={{ width: 100 }}>
          {Object.keys(TASK_CREATE_TYPE).map(key => (
            <Option value={Number(key)}>{changeChineseToLocale(TASK_CREATE_TYPE[key])}</Option>
          ))}
        </Select>,
      )}
      <QcFrequencyItemDetail form={form} config={config} />
      <ErrorContent form={form} />
    </FormItem>
  );
};

QcFrequencyItem.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

/** 自动创建质检任务项 */
const AutoCreateTaskItem = (props, context) => {
  const { form, autoCreateQcTask } = props;
  const { changeChineseToLocale } = context;
  const rules = [{ required: true, message: changeChineseToLocale('自动创建质检任务必填') }];
  const fieldOptions = { initialValue: autoCreateQcTask, rules };
  const radioOptions = [
    { label: changeChineseToLocale('是'), value: true },
    { label: changeChineseToLocale('否'), value: false },
  ];

  return (
    <RadioItem
      label={changeChineseToLocale('自动创建质检任务')}
      fieldId="autoCreateQcTask"
      fieldOptions={fieldOptions}
      radioOptions={radioOptions}
      form={form}
    />
  );
};

AutoCreateTaskItem.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export const getCustomRule = customRuleList => ({
  firstCheckLocationRule: customRuleList.filter(n => n.action === 'first_check_location')[0] || {},
  firstCheckOperatorRule: customRuleList.filter(n => n.action === 'first_check_operator')[0] || {},
  prodCheckLocationRule: customRuleList.filter(n => n.action === 'pro_check_location')[0] || {},
  prodCheckOperatorRule: customRuleList.filter(n => n.action === 'pro_check_operator')[0] || {},
});

type Props = {
  qcConfigData: {},
  qcPlanProcess: {},
  form: any,
  editing: Boolean,
  visible: Boolean,
  customRuleList: [],
};

/** 质检计划配置面板 */
class QcPlanQcConfigPanel extends Component {
  props: Props;
  state = {};

  getCustomRuleConfig = (customRuleList, checkType) => {
    const {
      firstCheckLocationRule,
      firstCheckOperatorRule,
      prodCheckLocationRule,
      prodCheckOperatorRule,
    } = getCustomRule(customRuleList);
    if (checkType === PRODUCE_ORIGIN_QC) {
      const noCheckWorkstationByFirstCheck =
        (firstCheckLocationRule.ruleType === sameAsProdWorkstationByFirstCheck && firstCheckLocationRule.status) ||
        (firstCheckLocationRule.ruleType === noWorkstationByFirstCheck && firstCheckLocationRule.status);

      const noCheckOperatorByFirstCheck =
        (firstCheckOperatorRule.ruleType === prodOperatorByFirstCheck && firstCheckOperatorRule.status) ||
        (firstCheckOperatorRule.ruleType === noOperatorByFirstCheck && firstCheckOperatorRule.status) ||
        (firstCheckOperatorRule.ruleType === sameAsProdOperatorByFirstCheck && firstCheckOperatorRule.status);

      return {
        noCheckWorkstation: noCheckWorkstationByFirstCheck,
        noCheckOperator: noCheckOperatorByFirstCheck,
      };
    }

    const noCheckWorkstationByProdCheck =
      (prodCheckLocationRule.ruleType === sameAsProdWorkstationByProdCheck && prodCheckLocationRule.status) ||
      (prodCheckLocationRule.ruleType === noWorkstationByProdCheck && prodCheckLocationRule.status);
    const noCheckOperatorByProdCheck =
      (prodCheckOperatorRule.ruleType === prodOperatorByProdCheck && prodCheckOperatorRule.status) ||
      (prodCheckOperatorRule.ruleType === sameAsProdOperatorByProdCheck && prodCheckOperatorRule.status) ||
      (prodCheckOperatorRule.ruleType === noOperatorByProdCheck && prodCheckOperatorRule.status);

    return {
      noCheckWorkstation: noCheckWorkstationByProdCheck,
      noCheckOperator: noCheckOperatorByProdCheck,
    };
  };

  render() {
    const { qcConfigData, form, visible, customRuleList } = this.props;
    const useQrCode = includeOrganizationConfig(ORGANIZATION_CONFIG.useQrcode);
    if (_.isEmpty(qcConfigData) || arrayIsEmpty(customRuleList)) return null;
    const {
      id,
      name,
      code,
      qcUnit,
      checkType,
      autoCreateQcTask,
      checkCountType,
      checkCount,
      recordType,
      scrapInspection,
      attachmentDetails,
      qcCheckItemConfigs,
      operator,
      workstation,
      sampleRecordNeeded,
    } = qcConfigData;
    const { changeChineseToLocale } = this.context;
    const materialQrCodeItemVisible = checkType === FIRST_QUALITY_CONTROL;
    const { noCheckWorkstation, noCheckOperator } = this.getCustomRuleConfig(customRuleList, checkType);

    /** 生产检才有质检频次 */
    return (
      <div className={styles.qcPlan_qcConfig_panel} style={visible ? {} : invisibleStyle}>
        <p>{name}</p>
        <FormItem style={invisibleStyle}>
          {form.getFieldDecorator('qcConfigId', { initialValue: id })(<Input />)}
        </FormItem>
        <FormItem label={changeChineseToLocale('编号')}>{code}</FormItem>
        <AutoCreateTaskItem form={form} autoCreateQcTask={autoCreateQcTask} />
        <RecordMaterialQrCodeItem
          form={form}
          value={sampleRecordNeeded}
          visible={isQrCodeItemVisible({ useQrCode, checkType })}
        />
        <QcFrequencyItem form={form} config={qcConfigData} />
        {!noCheckWorkstation ? (
          <FormItem label={changeChineseToLocale('工位')}>
            {form.getFieldDecorator('workstation', {
              initialValue: workstation,
            })(<Searchselect style={formItemBaseStyle} type="workstation" params={{ status: 1 }} />)}
          </FormItem>
        ) : null}
        {!noCheckOperator ? (
          <FormItem label={changeChineseToLocale('质检执行人')}>
            {form.getFieldDecorator('operator', {
              initialValue: operator,
            })(<Searchselect style={formItemBaseStyle} type="qualityMembers" />)}
          </FormItem>
        ) : null}
        <FormItem label={changeChineseToLocale('质检方式')}>
          <Select style={formItemBaseStyle} disabled value={changeChineseToLocale(CHECKCOUNT_TYPE[checkCountType])}>
            {Object.keys(CHECKCOUNT_TYPE).map(key => (
              <Option value={Number(key)}>{changeChineseToLocale(CHECKCOUNT_TYPE[key])}</Option>
            ))}
          </Select>
        </FormItem>
        {[FULL_CHECK, CUSTOM_CHECK, AQL_CHECK, CHECKITEM_CHECK].includes(checkCountType) ? null : (
          <FormItem label={changeChineseToLocale('质检数量')}>
            <InputNumber
              value={checkCount}
              style={checkCountType === 1 ? { width: 200 } : formItemBaseStyle}
              disabled
            />
            {checkCountType === 1 ? <Input style={{ width: 90, marginLeft: 10 }} value="%" disabled /> : null}
          </FormItem>
        )}
        {qcUnit ? <FormItem label={changeChineseToLocale('质检单位')}>{qcUnit && qcUnit.qcUnitName}</FormItem> : null}
        <FormItem label={changeChineseToLocale('记录方式')}>
          <Select value={recordType} style={formItemBaseStyle} disabled>
            {Object.keys(RECORD_TYPE).map(key => {
              const recordType = RECORD_TYPE[key];
              const display = _.get(recordType, 'display', '');
              return <Option value={Number(key)}>{changeChineseToLocale(display)}</Option>;
            })}
          </Select>
        </FormItem>
        {useQrCode ? (
          <FormItem label={changeChineseToLocale('报废性检查')}>
            <Radio.Group
              disabled
              value={scrapInspection}
              style={formItemBaseStyle}
              options={[
                { label: changeChineseToLocale('是'), value: true },
                { label: changeChineseToLocale('否'), value: false },
              ]}
            />
          </FormItem>
        ) : null}
        <FormItem label={changeChineseToLocale('附件')}>
          {!arrayIsEmpty(attachmentDetails) ? AttachmentFile(attachmentDetails) : replaceSign}
        </FormItem>
        <FormItem label={changeChineseToLocale('质检项列表')}>
          <QcItemsTable
            checkCountType={checkCountType}
            data={qcCheckItemConfigs}
            style={{ minWidth: 700, maxWidth: 1000, margin: 0 }}
          />
        </FormItem>
      </div>
    );
  }
}

QcPlanQcConfigPanel.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default withForm({}, QcPlanQcConfigPanel);
