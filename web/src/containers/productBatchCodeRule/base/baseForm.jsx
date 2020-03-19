import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import RuleTypeSelect from 'src/containers/productBatchCodeRule/base/ruleTypeSelect';
import { Textarea, withForm, Form, FormItem, Input } from 'src/components';
import { checkStringLength } from 'src/components/form';

import RuleDetailFormTable from './ruleDetailFormTable';

// 表单的输入框的样式
const formItemStyle = { width: 300 };

class CreateProductBatchCode extends Component {
  state = {};

  componentDidMount() {
    const { initialData } = this.props;
    if (initialData) {
      this.setFormInitialValue(initialData);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.initialData, this.props.initialData)) {
      this.setFormInitialValue(nextProps.initialData);
    }
  }

  setFormInitialValue = initialData => {
    const { form } = this.props;
    const { ruleType } = initialData || {};

    this.onChangeForRuleType(ruleType);
    form.setFieldsValue(initialData);
  };

  getFormValue = () => {
    const { validateFieldsAndScroll } = this.props.form;

    let res = null;
    validateFieldsAndScroll((err, values) => {
      if (err) return;
      res = values;
    });

    return res;
  };

  onChangeForRuleType = v => {
    const { form } = this.props;

    this.setState({ ruleType: v }, () => {
      const itemsLength = form.getFieldValue('items');

      const valueSources = [];
      itemsLength.forEach((__, i) => {
        valueSources.push(`items[${i}].valueSource`);
      });

      form.resetFields(valueSources);
    });
  };

  render() {
    const { form, initialData } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator } = form || {};

    return (
      <div>
        <Form>
          <FormItem label={'批号规则'}>
            {getFieldDecorator('ruleName', {
              rules: [
                {
                  required: true,
                  message: changeChineseToLocale('批号规则必填'),
                },
                {
                  validator: checkStringLength(),
                },
              ],
            })(<Input placeholder={changeChineseToLocale('请输入批号规则名称')} style={formItemStyle} />)}
          </FormItem>
          <FormItem label={'规则类型'}>
            {getFieldDecorator('ruleType', {
              rules: [
                {
                  required: true,
                  message: changeChineseToLocale('批号规则必填'),
                },
              ],
              onChange: v => {
                this.onChangeForRuleType(v);
              },
            })(<RuleTypeSelect style={formItemStyle} />)}
          </FormItem>
          <FormItem label={'规则描述'}>
            {getFieldDecorator('description')(
              <Textarea placeholder={changeChineseToLocale('请输入规则描述')} style={{ height: 100, ...formItemStyle }} maxLength={250} />,
            )}
          </FormItem>
          <FormItem label={'规则明细'}>
            {
              <RuleDetailFormTable
                ruleType={this.state.ruleType}
                initialValue={initialData ? initialData.items : null}
                form={form}
              />
            }
          </FormItem>
        </Form>
      </div>
    );
  }
}

CreateProductBatchCode.propTypes = {
  style: PropTypes.object,
  form: PropTypes.object,
  initialData: PropTypes.object,
};

CreateProductBatchCode.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, CreateProductBatchCode);
