import React, { Component } from 'react';
import BigJs from 'big.js';
import { InputNumber, withForm, Button, Select } from 'components';
import { amountValidator } from 'components/form';
import moment from 'utils/time';

const Option = Select.Option;

function range(start, end) {
  const result = [];
  for (let i = start; i < end; i += 1) {
    result.push(i);
  }
  return result;
}

class WorkingTimeSelectModal extends Component {
  props: {
    form: {},
    onOk: () => {},
    onCancel: () => {},
  };
  state = {};

  getDisabledTime = current => {
    if (current && current.isSame(moment(), 'day')) {
      return {
        disabledHours: () => range(0, moment().hour() + (moment().minute() ? 1 : 0)),
      };
    }
    return {};
  };

  render() {
    const { onOk, form, onCancel } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    return (
      <div>
        <div style={{ margin: '5px 20px', padding: 30 }}>
          {getFieldDecorator('workingTime', {
            rules: [{ required: true, message: '时间必填' }, { validator: amountValidator() }],
          })(<InputNumber />)}{' '}
          {getFieldDecorator('workingTimeUnit', {
            initialValue: 'm',
            onChange: workingTimeUnit => {
              const oldWorkingTime = getFieldValue('workingTime');
              const oldWorkingTimeUnit = getFieldValue('workingTimeUnit');
              let workingTime = oldWorkingTime;
              if (!workingTime) {
                return;
              }
              if (oldWorkingTimeUnit === 'm' && workingTimeUnit === 'h') {
                workingTime = new BigJs(workingTime)
                  .div(60)
                  .round(6)
                  .valueOf();
              } else if (oldWorkingTimeUnit === 'h' && workingTimeUnit === 'm') {
                workingTime = new BigJs(workingTime)
                  .times(60)
                  .round(6)
                  .valueOf();
              } else if (oldWorkingTimeUnit === 'h' && workingTimeUnit === 'd') {
                workingTime = new BigJs(workingTime)
                  .div(24)
                  .round(6)
                  .valueOf();
              } else if (oldWorkingTimeUnit === 'd' && workingTimeUnit === 'h') {
                workingTime = new BigJs(workingTime)
                  .times(24)
                  .round(6)
                  .valueOf();
              } else if (oldWorkingTimeUnit === 'd' && workingTimeUnit === 'm') {
                workingTime = new BigJs(workingTime)
                  .times(60 * 24)
                  .round(6)
                  .valueOf();
              } else if (oldWorkingTimeUnit === 'm' && workingTimeUnit === 'd') {
                workingTime = new BigJs(workingTime)
                  .div(60 * 24)
                  .round(6)
                  .valueOf();
              }
              setFieldsValue({ workingTime });
            },
          })(
            <Select style={{ width: 100 }}>
              <Option value={'d'}>天</Option>
              <Option value={'h'}>小时</Option>
              <Option value={'m'}>分钟</Option>
            </Select>,
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          <Button style={{ width: 100 }} type="ghost" onClick={() => onCancel()}>
            取消
          </Button>
          <Button style={{ width: 100, marginLeft: 40 }} onClick={() => onOk(form.getFieldsValue())}>
            确定
          </Button>
        </div>
      </div>
    );
  }
}

export default withForm({}, WorkingTimeSelectModal);
