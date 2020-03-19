import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { withForm, InputNumber, Icon, FormItem, Form, Input, Select } from 'src/components';
import { checkStringLength, amountValidator } from 'src/components/form';
import { PRIORITY } from 'src/containers/exceptionalEvent/constant';

const COMMON_FORMITEM_WIDTH = 100;
const formItemStyle = {
  width: 500,
  margin: 'auto',
  paddingRight: 0,
};

type Props = {
  disabled: boolean,
  form: {},
  initialValue: {},
};

class BaseForm extends Component {
  props: Props;
  state = {};

  componentWillReceiveProps(nextProps) {
    const { initialValue: nowInitialValue, form } = this.props;
    const { initialValue: nextInitialValue } = nextProps;

    if (!_.isEqual(nowInitialValue, nextInitialValue)) {
      const { name, priority, overdueTimeout } = nextInitialValue;
      form.setFieldsValue({
        name,
        overdueDate: overdueTimeout,
        priority: typeof priority === 'number' ? priority.toString() : null,
      });
    }
  }

  render() {
    const { form, initialValue } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator } = form;

    // 内置类型不可编辑名称
    const { internal } = initialValue || {};

    return (
      <Form>
        <FormItem label={'类型名称'} style={formItemStyle}>
          {getFieldDecorator('name', {
            rules: [
              {
                required: true,
                message: '类型必填',
              },
              {
                validator: checkStringLength(20),
              },
            ],
          })(<Input disabled={internal} style={{ width: 310 }} placeholder={'请输入类型名称'} />)}
        </FormItem>
        <FormItem label={'默认重要性'} style={formItemStyle}>
          {getFieldDecorator('priority', {
            rules: [
              {
                required: true,
                message: '重要性必填',
              },
            ],
            initialValue: '0',
          })(
            <Select
              style={{ width: COMMON_FORMITEM_WIDTH }}
              placeholder={
                <div>
                  <Icon iconType={'gc'} type={'shijiandengji_yiban'} />
                  <span>{changeChineseToLocale('一般')}</span>
                </div>
              }
            >
              {Object.entries(PRIORITY).map(([value, options]) => {
                const { display, iconType, iconColor } = options;

                return (
                  <Select.Option value={value}>
                    <Icon iconType={'gc'} type={iconType} style={{ color: iconColor }} />
                    {changeChineseToLocale(display)}
                  </Select.Option>
                );
              })}
            </Select>,
          )}
        </FormItem>
        <FormItem label={'默认逾期时间'} style={formItemStyle}>
          {getFieldDecorator('overdueDate', {
            rules: [
              {
                required: true,
                message: '默认逾期时间必填',
              },
              {
                validator: amountValidator(120, 0, 'integer'),
              },
            ],
            initialValue: 0,
          })(<InputNumber style={{ width: COMMON_FORMITEM_WIDTH }} placeholder={'不逾期'} />)}
          <span style={{ marginLeft: 10 }}>{changeChineseToLocale('分钟')}</span>
        </FormItem>
      </Form>
    );
  }
}

BaseForm.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, BaseForm);
