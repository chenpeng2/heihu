import React, { Component } from 'react';
import _ from 'lodash';

import { InputNumber, withForm, FormItem, Form, Select } from 'src/components';

const Option = Select.Option;

const TYPE_OPTION = {
  beat: '生产节拍',
  capacity: '产能',
};

const TIME_UNIT_OPTION_FOR_CAPACITY = {
  1: '1小时',
  8: '8小时',
  24: '24小时',
};

const TIME_UNIT_OPTION_FOR_BEAT = {
  second: '秒',
  minute: '分钟',
  hour: '小时',
};

const UNIT_SELECT_WIDTH = 100;

// standardSelect的validate
export const validateFormValue = value => {
  if (!value) return null;
  const { type, timeUnit, time, amount } = value;

  // 小数点长度检查
  const fractionLengthCheck = (v, type) => {
    const maxLength = 6;
    const fraction = v && v.toString().split('.')[1];
    if (fraction && fraction.length > maxLength) {
      /* 检查输入的数字小数点后是否多于6位 */
      return `${type}小数点后最多保留${maxLength}位数字`;
    }
  };

  if (type === 'beat') {
    if (!time && typeof time !== 'number') return '时间必填';
    if (time <= 0) return '时间必须大于0';

    if (!timeUnit) return '时间单位必填';

    if (timeUnit === 'second' || timeUnit === 'minute') {
      if (time <= 0 || time > 10000) return '秒或分钟不可以小于等于0或大于10000';
    }
    if (timeUnit === 'hour') {
      if (time <= 0 || time > 10000) return '小时不可以小于等于0或大于10000';
    }

    return fractionLengthCheck(time, '时间');
  }

  if (type === 'capacity') {
    if (!time) return '时间必填';
    if (amount <= 0 || amount > 1000000) return '数量不可以小于等于0或大于1000000';

    return fractionLengthCheck(amount, '数量');
  }

  return null;
};

type Props = {
  form: {},
  selectStyle: {},
  value: {},
  materialUnitName: string,
};

class StandardInput extends Component {
  props: Props;
  state = {
    type: null,
  };

  componentWillReceiveProps(nextProps) {
    const { value, form } = nextProps;
    const { value: valueNow } = this.props;

    const { setFieldsValue } = form;
    const { type, timeUnit, time, amount } = value || {};

    if (!_.isEqual(value, valueNow)) {
      this.setState(
        {
          type,
        },
        () => {
          setFieldsValue({
            type,
            timeUnit,
            time,
            amount,
          });
        },
      );
    }
  }

  render() {
    const { type } = this.state;
    const { form, selectStyle, materialUnitName } = this.props;
    const { getFieldDecorator, resetFields } = form;

    return (
      <Form layout={'inline'}>
        <FormItem>
          {getFieldDecorator('type', {
            onChange: value => {
              resetFields(['time', 'timeUnit', 'amount']);
              this.setState({
                type: value,
              });
            },
          })(
            <Select style={selectStyle}>
              {Object.entries(TYPE_OPTION).map(([value, label]) => {
                return (
                  <Option key={value} value={value}>
                    {label}
                  </Option>
                );
              })}
            </Select>,
          )}
        </FormItem>
        {type === 'beat' ? (
          <React.Fragment>
            <FormItem>{getFieldDecorator('time')(<InputNumber />)}</FormItem>
            <FormItem>
              {getFieldDecorator('timeUnit')(
                <Select style={{ width: UNIT_SELECT_WIDTH }}>
                  {Object.entries(TIME_UNIT_OPTION_FOR_BEAT).map(([value, label]) => {
                    return (
                      <Option key={value} value={value}>
                        {label}
                      </Option>
                    );
                  })}
                </Select>,
              )}
            </FormItem>
            <FormItem>{`生产一${materialUnitName || '个'}物料`}</FormItem>
          </React.Fragment>
        ) : null}
        {type === 'capacity' ? (
          <React.Fragment>
            <FormItem>每</FormItem>
            <FormItem>
              {getFieldDecorator('time')(
                <Select style={{ width: UNIT_SELECT_WIDTH }}>
                  {Object.entries(TIME_UNIT_OPTION_FOR_CAPACITY).map(([value, label]) => {
                    return (
                      <Option key={value} value={value}>
                        {label}
                      </Option>
                    );
                  })}
                </Select>,
              )}
            </FormItem>
            <FormItem>生产</FormItem>
            <FormItem>{getFieldDecorator('amount')(<InputNumber />)}</FormItem>
            <FormItem>{materialUnitName || '个'}</FormItem>
          </React.Fragment>
        ) : null}
      </Form>
    );
  }
}

export default withForm(
  {
    onValuesChange: (props, value, allValues) => {
      props.onChange(allValues);
    },
  },
  StandardInput,
);
