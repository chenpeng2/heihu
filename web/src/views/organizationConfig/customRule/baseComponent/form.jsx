import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Popover, Icon, Radio, Select, withForm, FormItem, Form, InputNumber, TimePicker } from 'src/components';
import { checkPositiveInteger } from 'components/form';
import { content, primary } from 'src/styles/color';

import { ACTIONS, MANAGE, MODULES, BUSINESS_TYPE, formatDataToInitialData, RULE } from '../utils';

const Option = Select.Option;
const FORM_ITEM_WIDTH = 300;
const RadioGroup = Radio.Group;

type Props = {
  form: any,
};

class BaseForm extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    this.getField();
    this.setInitialValue();
  }

  componentDidUpdate(preProps) {
    if (!_.isEqual(preProps.initialData, this.props.initialData)) {
      this.setInitialValue(this.props);
    }
  }

  getField = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    getFieldDecorator('minutes', { initialValue: 0, rules: [{ validator: checkPositiveInteger() }] });
    getFieldDecorator('days', { initialValue: 0, rules: [{ validator: checkPositiveInteger() }] });
    getFieldDecorator('time');
  };

  setInitialValue = props => {
    const { initialData, form } = props || this.props;
    if (initialData) form.setFieldsValue(formatDataToInitialData(initialData));
  };

  getFormValue = () => {
    const { form } = this.props;
    let res = null;

    form.validateFieldsAndScroll((err, value) => {
      if (!err) res = value;
    });

    return res;
  };

  renderToolTipForCTL = () => {
    return (
      <span>
        <span style={{ marginRight: 5 }}>管控等级</span>
        <Popover
          content={
            <div style={{ color: content }}>
              <p>老黑友情提示：</p>
              <p>强管控限制：</p>
              <p>APP执行时按规则进行限制性校验，即只有满足要求的操作才能继续执行</p>
              <p>弱管控限制：</p>
              <p>APP执行时按规则进行非限制性校验，即系统只会进行友善提示，由执行人进行最终的决定</p>
            </div>
          }
          overlayStyle={{ width: 406 }}
        >
          <Icon type="exclamation-circle-o" color={primary} style={{ marginRight: 5 }} />
        </Popover>
      </span>
    );
  };

  renderMinutesAfterCreate = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <FormItem label={' '}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          创建质检任务的时间+
          {getFieldDecorator('minutes', {
            initialValue: 0,
            rules: [{ validator: checkPositiveInteger() }],
          })(<InputNumber style={{ margin: '0 5px' }} />)}
          分钟后
        </div>
      </FormItem>
    );
  };

  renderFixedTimeAfterCreate = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FormItem label={' '}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            创建质检任务后第
            {getFieldDecorator('days', {
              initialValue: 0,
              rules: [{ validator: checkPositiveInteger() }],
            })(<InputNumber style={{ margin: '0 5px' }} />)}
            天的
            {getFieldDecorator('time')(<TimePicker style={{ marginLeft: 5 }} format={'HH:mm'} />)}
          </div>
        </FormItem>
      </div>
    );
  };

  renderRuleSetting = () => {
    const {
      form: { getFieldValue },
    } = this.props;
    const ruleType = getFieldValue('ruleType');
    switch (ruleType) {
      case `${RULE.planStartTime.minutesAfterCreate.value}`:
        return this.renderMinutesAfterCreate();
      case `${RULE.planStartTime.fixedTimeAfterCreate.value}`:
        return this.renderFixedTimeAfterCreate();
      default:
        return null;
    }
  };

  render() {
    const { form, initialData } = this.props;
    const { module, actionName, rulesEnum } = initialData || {};
    const { getFieldDecorator } = form || {};
    const ruleFeature =
      module === '物料管理' ? 'storeManage' : actionName === '填写备注' ? 'qcReportRemark' : 'qcReportTransferNotice';

    return (
      <div>
        <Form>
          <FormItem label={'功能模块'}>
            {getFieldDecorator('module')(
              <Select disabled style={{ width: FORM_ITEM_WIDTH }}>
                {Object.values(MODULES).map(i => {
                  const { name, value } = i || {};
                  return <Option value={value}>{name}</Option>;
                })}
              </Select>,
            )}
          </FormItem>
          <FormItem label={'业务类型'}>
            {getFieldDecorator('businessType')(
              <Select disabled style={{ width: FORM_ITEM_WIDTH }}>
                {Object.values(BUSINESS_TYPE).map(i => {
                  const { name, value } = i || {};
                  return <Option value={value}>{name}</Option>;
                })}
              </Select>,
            )}
          </FormItem>
          <FormItem label={'功能名称'}>
            {getFieldDecorator('actionName', {
              rules: [
                {
                  required: true,
                  message: '功能名称必填',
                },
              ],
            })(
              <Select disabled style={{ width: FORM_ITEM_WIDTH }}>
                {Object.values(ACTIONS).map(i => {
                  const { name, value } = i || {};
                  return <Option value={value}>{name}</Option>;
                })}
              </Select>,
            )}
          </FormItem>
          {rulesEnum ? (
            <FormItem label={'规则类型'}>
              {getFieldDecorator('ruleType', {
                rules: [
                  {
                    required: true,
                    message: '规则类型必填',
                  },
                ],
              })(
                <Select style={{ width: FORM_ITEM_WIDTH }}>
                  {Object.entries(rulesEnum).map(([key, value]) => {
                    return <Option value={key}>{value}</Option>;
                  })}
                </Select>,
              )}
            </FormItem>
          ) : null}
          {this.renderRuleSetting()}
          <FormItem label={<span>{this.renderToolTipForCTL()}</span>}>
            {getFieldDecorator('ctlLevel', {
              rules: [
                {
                  required: ruleFeature === 'storeManage',
                  message: '管控层级必填',
                },
              ],
            })(
              <RadioGroup>
                {Object.values(MANAGE).map(i => {
                  const { name, value } = i;
                  return <Radio value={value}>{name}</Radio>;
                })}
              </RadioGroup>,
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}

BaseForm.propTypes = {
  style: PropTypes.object,
  initialData: PropTypes.any,
};

export default withForm({}, BaseForm);
