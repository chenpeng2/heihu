import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'src/utils/time';
import {
  withForm,
  FormItem,
  Input,
  Textarea,
  DatePicker,
  Radio,
  Select,
  Searchselect,
  Attachment,
  Checkbox,
} from 'src/components';
import { getStrategyGroupList } from 'src/services/equipmentMaintenance/base';
import { getMetricList } from 'src/services/equipmentMaintenance/device';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { STRATEGY_CATEGORY, STRATEGY_TRIGGER_TYPE, REPAIR } from 'src/views/equipmentMaintenance/constants';
import PeriodInput from './periodInput';
import PlanLaborInput from './planLaborInput';
import MetricInput from './metricInput';
import { strategyProgram } from './formatValue';
import styles from './styles.scss';

const RadioGroup = Radio.Group;
const Option = Select.Option;
const itemWidth = 300;
const timeFormat = 'YYYY-MM-DD HH:mm';

type Props = {
  form: {},
  intl: any,
  deviceMetricIds: [],
  type: string,
  changeIndex: number,
  changeStrategy: () => {},
  onSubmitScroll: () => {},
  data: [],
};

class ConfigModal extends Component {
  props: Props;

  state = {
    plan: '5',
    enabledApplicationCount: 0,
    strategyGroups: [],
    metricList: [],
    config: [],
  };

  componentWillMount() {
    this.handleMetricSearch('');
  }

  componentDidMount() {
    const {
      data,
      form: { setFieldsValue },
      type,
    } = this.props;
    if (type === 'edit') {
      if (!data.useFormValue) {
        const {
          strategyTitle,
          strategyDescription,
          strategyGroup,
          strategyStartTime,
          strategyEndTime,
          strategyCategory,
          strategyTriggerType,
          taskTitle,
          taskPlanLaborTimeAmount,
          taskPlanLaborTimeUnit,
          taskReportTemplate,
          taskScan,
          strategyTriggerSchema,
          deviceMetric,
          taskAcceptanceCheck,
          executors,
          taskDescription,
          taskAttachmentFiles,
          enabledApplicationCount,
        } = data;
        const { metricBaseValue, metricCompareType, period, timeUnit } = strategyTriggerSchema || {};
        const { metricName, id: metricId, metricUnitName } = deviceMetric || {};
        this.setState({
          plan: `${strategyTriggerType}`,
          cycle: { validPeriod: period, validPeriodUnit: timeUnit },
          planLaborTime: { validPeriod: `${taskPlanLaborTimeAmount}`, validPeriodUnit: `${taskPlanLaborTimeUnit}` },
          metricValue: { unit: metricUnitName, metricBaseValue, metricCompareType },
          metric: deviceMetric && { key: `${metricId}/${metricUnitName}`, label: metricName },
          enabledApplicationCount,
        });
        const value = {
          strategyTitle,
          strategyDescription,
          strategyGroup: strategyGroup && { key: strategyGroup.id, label: strategyGroup.title },
          strategyStartTime: strategyStartTime && moment(strategyStartTime),
          strategyEndTime: strategyEndTime && moment(strategyEndTime),
          strategyCategory: `${strategyCategory}`,
          strategyTriggerType: strategyProgram.filter(n => n.key === `${strategyTriggerType}`)[0],
          taskTitle,
          taskAttachment:
            taskAttachmentFiles && taskAttachmentFiles.length
              ? taskAttachmentFiles.map(n => ({ id: n.id, restId: n.id, originalFileName: n.original_filename }))
              : [],
          taskDescription,
          executors: executors.map(({ executorType, executorName, executorId }) => ({
            key: `${executorType === 1 ? 'user' : 'workgroup'}:${executorId}`,
            label: executorName,
          })),
          taskReportTemplateId: taskReportTemplate && {
            key: taskReportTemplate.id,
            label: taskReportTemplate.name,
          },
          taskScan,
          taskAcceptanceCheck,
        };
        setFieldsValue(value);
      } else {
        const {
          strategyTriggerType,
          enabledApplicationCount,
          period,
          taskPlanLaborHour,
          metric,
          metricBaseValue: formMetricBaseValue,
        } = data;
        const { validPeriod, validPeriodUnit } = period || {};
        const { validPeriod: laborPeriod, validPeriodUnit: laborPeriodUnit } = taskPlanLaborHour || {};
        const { metricBaseValue, metricCompareType, unit } = formMetricBaseValue || {};
        this.setState({
          plan: strategyTriggerType && strategyTriggerType.key,
          enabledApplicationCount: enabledApplicationCount || 0,
          cycle: period && { validPeriod, validPeriodUnit: validPeriodUnit.key || validPeriodUnit.value },
          planLaborTime: taskPlanLaborHour && {
            validPeriod: laborPeriod,
            validPeriodUnit: laborPeriodUnit.key || laborPeriodUnit.value,
          },
          metric,
          metricValue: metricBaseValue && { unit, metricBaseValue, metricCompareType },
        });
        setFieldsValue(data);
      }
    }
  }

  handleSearch = async search => {
    const {
      data: { data },
    } = await getStrategyGroupList({ searchContent: search });
    const strategyGroups = data.map(({ id, title }) => ({
      key: `${id}`,
      label: title,
    }));
    this.setState({ strategyGroups, search });
  };

  handleMetricSearch = async search => {
    const {
      deviceMetricIds,
      form: { setFieldsValue },
    } = this.props;
    const {
      data: { data },
    } = await getMetricList({
      searchCategoryType: 1,
      searchContent: search,
    });
    const metricList = data.map(({ id, metricName, metricUnitName }) => ({
      key: `${id}/${metricUnitName}`,
      label: metricName,
    }));
    let list = [];
    _.uniq(deviceMetricIds).forEach(n => {
      list = list.concat(metricList.filter(m => m.key.split('/')[0] === n));
    });
    this.setState({ metricList: list, search }, () => {
      setFieldsValue({ metric: this.state.metric });
    });
  };

  submit() {
    const {
      form: { validateFields },
      changeStrategy,
      data,
      type,
      changeIndex,
      onSubmitScroll,
    } = this.props;
    validateFields((err, values) => {
      if (!err) {
        values.uid = _.uniqueId();
        if (type === 'edit') {
          values.strategyCode = data.strategyCode;
          values.enabledApplicationCount = data.enabledApplicationCount;
        } else {
          onSubmitScroll();
        }
        changeStrategy(values, type, changeIndex);
      }
      return null;
    });
  }

  range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i += 1) {
      result.push(i);
    }
    return result;
  };

  getDisabledStrategyStartTime = () => {
    const {
      form: { getFieldValue },
    } = this.props;
    const startTime = getFieldValue('strategyStartTime');
    const endTime = getFieldValue('strategyEndTime');
    if (endTime && startTime && moment(startTime).dayOfYear() === moment(endTime).dayOfYear()) {
      return {
        disabledHours: () => this.range(0, 24).splice(moment(endTime).hour() + 1),
        disabledMinutes: () => this.range(0, 60).splice(moment(endTime).minute()),
      };
    }
  };

  getDisabledStrategyStartDate = current => {
    const {
      form: { getFieldValue },
    } = this.props;
    const endTime = getFieldValue('strategyEndTime');
    return endTime && current && moment(current).endOf('day') > moment(endTime).endOf('day');
  };

  getDisabledStrategyEndTime = () => {
    const {
      form: { getFieldValue },
    } = this.props;
    const startTime = getFieldValue('strategyStartTime');
    const endTime = getFieldValue('strategyEndTime');
    if (startTime && endTime && moment(startTime).dayOfYear() === moment(endTime).dayOfYear()) {
      return {
        disabledHours: () => this.range(0, 24).splice(0, moment(startTime).hour()),
        disabledMinutes: () => this.range(0, 60).splice(0, moment(startTime).minute() + 1),
      };
    }
  };

  getDisabledStrategyEndDate = current => {
    const {
      form: { getFieldValue },
    } = this.props;
    const startTime = getFieldValue('strategyStartTime');
    return startTime && current && moment(current).endOf('day') < moment(startTime).endOf('day');
  };

  renderStrategyConfig = () => {
    const {
      form: { getFieldDecorator, getFieldValue },
      type,
      intl,
    } = this.props;
    const { plan, strategyGroups, metricList, cycle, metricValue, enabledApplicationCount } = this.state;
    delete STRATEGY_CATEGORY[REPAIR];
    return (
      <div>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>{changeChineseToLocale('策略配置', intl)}</div>
        <FormItem label="策略名称">
          {getFieldDecorator('strategyTitle', {
            rules: [
              { required: true, message: changeChineseToLocale('请输入策略名称', intl) },
              { min: 3, message: changeChineseToLocale('最少输入3个字符', intl) },
              { max: 40, message: changeChineseToLocale('最多可输入40个字符', intl) },
            ],
          })(<Input placeholder={'请输入'} style={{ width: itemWidth }} />)}
        </FormItem>
        <FormItem label="策略描述">
          {getFieldDecorator('strategyDescription')(
            <Textarea
              maxLength={200}
              placeholder={'如有需要，请描述详细策略内容'}
              style={{ width: itemWidth, height: 120 }}
            />,
          )}
        </FormItem>
        <div>
          <FormItem label="策略组">
            {getFieldDecorator('strategyGroup')(
              <Select
                style={{ width: itemWidth }}
                onSearch={this.handleSearch}
                onFocus={() => {
                  this.handleSearch('');
                }}
                allowClear
                labelInValue
              >
                {strategyGroups.map(({ key, label }) => (
                  <Option value={key}>{label}</Option>
                ))}
              </Select>,
            )}
          </FormItem>
        </div>
        <FormItem label="策略开始时间">
          {getFieldDecorator('strategyStartTime')(
            <DatePicker
              showTime
              format={timeFormat}
              placeholder={changeChineseToLocale('开始时间', intl)}
              style={{ width: itemWidth }}
              disabledTime={this.getDisabledStrategyStartTime}
              disabledDate={this.getDisabledStrategyStartDate}
            />,
          )}
        </FormItem>
        <FormItem label="策略结束时间">
          {getFieldDecorator('strategyEndTime')(
            <DatePicker
              showTime
              format={timeFormat}
              placeholder={changeChineseToLocale('结束时间', intl)}
              style={{ width: itemWidth }}
              disabledTime={this.getDisabledStrategyEndTime}
              disabledDate={this.getDisabledStrategyEndDate}
            />,
          )}
        </FormItem>
        <FormItem label="策略类型">
          {getFieldDecorator('strategyCategory', {
            rules: [{ required: true, message: changeChineseToLocale('请选择策略类型', intl) }],
          })(
            <RadioGroup
              options={Object.keys(STRATEGY_CATEGORY).map(prop => ({
                label: changeChineseToLocale(STRATEGY_CATEGORY[prop], intl),
                value: `${prop}`,
              }))}
            />,
          )}
        </FormItem>
        <FormItem label="策略方案">
          {getFieldDecorator('strategyTriggerType', {
            rules: [{ required: true, message: changeChineseToLocale('请选择策略方案', intl) }],
          })(
            <Select
              style={{ width: itemWidth }}
              disabled={enabledApplicationCount !== 0}
              labelInValue
              onSelect={value => {
                this.setState({ plan: value.key });
              }}
            >
              {Object.keys(STRATEGY_TRIGGER_TYPE).map(prop => (
                <Option value={prop}>{changeChineseToLocale(STRATEGY_TRIGGER_TYPE[prop], intl)}</Option>
              ))}
            </Select>,
          )}
        </FormItem>
        {plan === '1' || plan === '2' ? (
          <FormItem label="周期">
            {getFieldDecorator('period', {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    const reg = /^[0-9]*$/g;
                    if (!value.validPeriod && value.validPeriod !== 0) {
                      callback(changeChineseToLocale('请输入周期', intl));
                      return null;
                    }
                    if (!reg.test(value.validPeriod)) {
                      callback(changeChineseToLocale('必须为整数', intl));
                    }
                    if (value.validPeriod > 999) {
                      callback(changeChineseToLocale('数字必须小于等于999', intl));
                    }
                    if (value.validPeriod === 0) {
                      callback(changeChineseToLocale('数字必须大于0', intl));
                    }
                    callback();
                  },
                },
                { required: true, message: ' ' },
              ],
            })(<PeriodInput type={type} data={cycle} />)}
          </FormItem>
        ) : null}
        {plan === '3' || plan === '4' ? (
          <React.Fragment>
            <FormItem label="用度名称">
              {getFieldDecorator('metric', {
                rules: [{ required: true, message: changeChineseToLocale('请选择设备读数', intl) }],
              })(
                <Select
                  style={{ width: itemWidth, marginTop: 8 }}
                  disabled={enabledApplicationCount !== 0}
                  placeholder={changeChineseToLocale('请选择设备读数', intl)}
                  onSearch={this.handleMetricSearch}
                  onFocus={() => {
                    this.handleMetricSearch('');
                  }}
                  labelInValue
                >
                  {metricList.map(({ key, label }) => (
                    <Option value={key}>{label}</Option>
                  ))}
                </Select>,
              )}
            </FormItem>
            <FormItem id={'metricBaseValue'} label="用度阈值">
              {getFieldDecorator('metricBaseValue', {
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      const { metricBaseValue } = value || {};
                      if (!metricBaseValue && metricBaseValue !== 0) {
                        callback(changeChineseToLocale('请输入用度阈值', intl));
                        return null;
                      }
                      const reg = /^(-?\d+)(\.)?(\d+)?$/;
                      const fraction = metricBaseValue && metricBaseValue.toString().split('.')[1];
                      if (!reg.test(metricBaseValue)) {
                        callback(changeChineseToLocale('必须是数字', intl));
                      }
                      if (fraction && fraction.length > 3) {
                        callback(changeChineseToLocale('最多输入三位小数', intl));
                      }
                      if (metricBaseValue > 999999999.999) {
                        callback(changeChineseToLocale('最多输入九位整数', intl));
                      }
                      if (metricBaseValue <= 0) {
                        callback(changeChineseToLocale('数字必须大于0', intl));
                      }
                      callback();
                    },
                  },
                  { required: true, message: ' ' },
                ],
              })(
                <MetricInput
                  strategyTriggerType={plan}
                  disabled={enabledApplicationCount !== 0}
                  type={type}
                  data={metricValue}
                  unit={getFieldValue('metric') && getFieldValue('metric').key.split('/')[1]}
                />,
              )}
            </FormItem>
          </React.Fragment>
        ) : null}
      </div>
    );
  };

  renderTaskConfig = () => {
    const {
      form: { getFieldDecorator, getFieldValue },
      type,
      intl,
    } = this.props;
    const { planLaborTime } = this.state;
    const checkPlanOperatorAuth = 'APP_PERFORM_CHECK_TASK';
    const maintainPlanOperatorAuth = 'APP_PERFORM_MAINTAIN_TASK';
    const category = getFieldValue('strategyCategory');

    return (
      <div>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>{changeChineseToLocale('任务配置', intl)}</div>
        <FormItem label="任务标题">
          {getFieldDecorator('taskTitle', {
            rules: [
              { required: true, message: changeChineseToLocale('请输入任务标题', intl) },
              { min: 3, message: changeChineseToLocale('最少输入3个字符', intl) },
              { max: 60, message: changeChineseToLocale('最多可输入60个字符', intl) },
            ],
          })(<Input placeholder={'请输入'} style={{ width: itemWidth }} />)}
        </FormItem>
        <FormItem label="任务详情">
          {getFieldDecorator('taskDescription')(
            <Textarea
              maxLength={200}
              placeholder={'如有需要，请描述详细任务内容'}
              style={{ width: itemWidth, height: 120 }}
            />,
          )}
        </FormItem>
        <FormItem label="计划执行人">
          {getFieldDecorator('executors', {
            rules: [{ required: true, message: changeChineseToLocale('请选择计划执行人', intl) }],
          })(
            <Searchselect
              params={{
                authorities: category && category.key === '2' ? maintainPlanOperatorAuth : checkPlanOperatorAuth,
              }}
              mode={'multiple'}
              placeholder={'请选择'}
              type={'userAndWorkgroup'}
              style={{ width: itemWidth }}
              extraSearch={category && category.key ? null : () => {}}
            />,
          )}
        </FormItem>
        {planLaborTime || type === 'create' ? (
          <FormItem label="计划工时">
            {getFieldDecorator('taskPlanLaborHour', {
              rules: [
                {
                  validator: (rule, value, callback) => {
                    const reg = /^[0-9]*$/g;
                    if (!value || (!value.validPeriod && value.validPeriod !== 0)) {
                      callback(changeChineseToLocale('请输入计划工时', intl));
                      return null;
                    }
                    if (!reg.test(value.validPeriod)) {
                      callback(changeChineseToLocale('必须为整数', intl));
                    }
                    if (value.validPeriod > 999) {
                      callback(changeChineseToLocale('数字必须小于等于999', intl));
                    }
                    if (value.validPeriod === 0) {
                      callback(changeChineseToLocale('数字必须大于0', intl));
                    }
                    callback();
                  },
                },
                { required: true, message: ' ' },
              ],
            })(<PlanLaborInput type={type} data={planLaborTime} />)}
          </FormItem>
        ) : null}
        <FormItem label="报告模板">
          {getFieldDecorator('taskReportTemplateId', {
            rules: [{ required: true, message: changeChineseToLocale('请选择报告模板', intl) }],
          })(
            <Searchselect
              allowClear={false}
              style={{ width: itemWidth }}
              placeholder="请选择报告模板"
              type={'reportTemplate'}
              key="reportTemplate"
            />,
          )}
        </FormItem>
        <FormItem label="相关图片">
          {getFieldDecorator('taskAttachment', {})(
            <Attachment
              style={{ width: 200, display: 'block', marginBottom: 30 }}
              tipStyle={{ marginLeft: 0, width: 300, lineHeight: '15px', marginTop: 4, top: 'unset' }}
              max={5}
              limit={'image'}
            />,
          )}
        </FormItem>
        <FormItem label="扫码确认" help="勾选后，维修任务操作人需要现场扫描电子标签，才能开始执行">
          {getFieldDecorator('taskScan', {
            initialValue: false,
            valuePropName: 'checked',
          })(<Checkbox>开启</Checkbox>)}
        </FormItem>
        <FormItem label="完成验收" help="勾选后，任务完成后，需要其他相关人员对执行效果进行验收">
          {getFieldDecorator('taskAcceptanceCheck', {
            initialValue: false,
            valuePropName: 'checked',
          })(<Checkbox>开启</Checkbox>)}
        </FormItem>
      </div>
    );
  };

  render() {
    console.log(1);
    return (
      <div className={styles.configModal} style={{ marginLeft: 65 }}>
        {this.renderStrategyConfig()}
        {this.renderTaskConfig()}
      </div>
    );
  }
}

export default injectIntl(withForm({ showFooter: true, hideCancel: true }, ConfigModal));
