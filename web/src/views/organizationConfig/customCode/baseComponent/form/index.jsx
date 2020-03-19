import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Icon, Popover, Textarea, DatePicker, Radio, withForm, FormItem, Form, Input } from 'src/components';
import { lengthValidate, CHINESE_ENGLISH_NUMBER_REG } from 'src/components/form';
import { content, primary } from 'src/styles/color';

import RuleDetailTableForm from './ruleDetailTableForm';
import { DEFAULT_USE_RANGE, CODE_TYPE } from '../../utils';

const FORM_ITEM_WIDTH = 300;
const RangePicker = DatePicker.RangePicker;

class BasicForm extends Component {
  state = {};

  componentDidMount() {
    this.setHeadInitialValue(this.props);
  }

  componentDidUpdate(preProps) {
    if (!_.isEqual(preProps.initialData, this.props.initialData)) {
      this.setHeadInitialValue(this.props);
    }
  }

  setHeadInitialValue = props => {
    const { initialData, form } = props;
    if (initialData) {
      delete initialData.ruleDetail;
      form.setFieldsValue(initialData);
    }
  };

  getFormValue = () => {
    const { form } = this.props;
    let res = null;

    form.validateFieldsAndScroll((err, value) => {
      if (!err) res = value;
    });

    return res;
  };

  renderToolTipForValidTime = () => {
    return (
      <span>
        <span style={{ marginRight: 5 }}>有效时间</span>
        <Popover
          content={
            <div style={{ color: content }}>
              同种编码类型在全工厂范围下未来时间内只能有一个编码规则
            </div>
          }
          overlayStyle={{ width: 406 }}
        >
          <Icon type="exclamation-circle-o" color={primary} style={{ marginRight: 5 }} />
        </Popover>
      </span>
    );
  };

  render() {
    const { form, initialData, type } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form>
        <FormItem label={'编码类型'}>
          {getFieldDecorator('codeType', {
            rules: [
              {
                required: true,
                message: '编码类型必填',
              },
            ],
            initialValue: CODE_TYPE.name,
          })(<Input disabled style={{ width: FORM_ITEM_WIDTH }} />)}
        </FormItem>
        <FormItem label={'编码名称'}>
          {getFieldDecorator('codeName', {
            rules: [
              {
                validator: lengthValidate(null, 50),
              },
              {
                pattern: CHINESE_ENGLISH_NUMBER_REG,
                message: '编码名称只支持中文，英文和数字',
              },
              {
                required: true,
                message: '编码名称必填',
              },
            ],
          })(<Input disabled={type === 'edit'} style={{ width: FORM_ITEM_WIDTH }} />)}
        </FormItem>
        <FormItem label={'适用范围'}>
          {getFieldDecorator('useRange', {
            initialValue: true,
            valuePropName: 'checked',
            rules: [
              {
                required: true,
                message: '适用范围必填',
              },
            ],
          })(<Radio disabled>{DEFAULT_USE_RANGE.name}</Radio>)}
        </FormItem>
        <FormItem label={<span>{this.renderToolTipForValidTime()}</span>}>
          {getFieldDecorator('validTime', {
            rules: [
              {
                required: true,
                message: '有效时间必填',
              },
            ],
          })(<RangePicker style={{ width: FORM_ITEM_WIDTH }} />)}
        </FormItem>
        <FormItem label={'编码规则明细'}>
          <RuleDetailTableForm disabled={type === 'edit'} form={form} initialData={initialData ? initialData.ruleDetail : null} />
        </FormItem>
        <FormItem label={'编码规则描述'}>
          {getFieldDecorator('desc', {
            rules: [
              {
                validator: lengthValidate(null, 100),
              },
            ],
          })(<Textarea maxLength={100} style={{ height: 100, width: FORM_ITEM_WIDTH }} />)}
        </FormItem>
      </Form>
    );
  }
}

BasicForm.propTypes = {
  style: PropTypes.object,
  initialData: PropTypes.any,
  type: PropTypes.string,
};

export default withForm({}, BasicForm);
