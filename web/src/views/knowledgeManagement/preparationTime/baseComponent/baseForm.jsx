import React, { Component } from 'react';
import { Form } from 'antd';
import { codeFormat, amountValidator } from 'src/components/form';
import WorkstationAndAreaSelect from 'src/components/select/workstationAndAreaSelect';
import { Input, Select, Radio, FormItem, InputNumber } from 'components';
import BigJs from 'big.js';
import { STATUS, TYPES } from '../utils';

const RadioGroup = Radio.Group;
const Option = Select.Option;

type Props = {
  match: {},
  edit: boolean,
  form: {
    getFieldDecorator: () => {},
  },
};

export const formatValue = value => {
  const { time, unit, workstationId } = value;
  if (workstationId) {
    const [type, id] = (workstationId.value || '').split('-');
    value.workstationId = id;
  }
  if (unit === 'm') {
    value.time = new BigJs(time)
      .times(60 * 1000)
      .round(6)
      .valueOf();
  } else if (unit === 'h') {
    value.time = new BigJs(time)
      .times(60 * 60 * 1000)
      .round(6)
      .valueOf();
  }
  return value;
};

class BaseForm extends Component {
  props: Props;
  state = {};

  render() {
    const { form, edit } = this.props;
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
    return (
      <Form>
        <FormItem label="编号">
          {getFieldDecorator('code', {
            rules: [
              { required: true, message: '请输入编号' },
              { min: 0, max: 50, message: '编号长度不能超过50个字' },
              { validator: codeFormat('编号') },
            ],
          })(<Input disabled={edit} />)}
        </FormItem>
        <FormItem label="状态">
          {getFieldDecorator('status', {
            initialValue: STATUS[0].value,
            rules: [{ required: true, message: '状态不能为空' }],
          })(
            <RadioGroup disabled={edit}>
              {STATUS.map(({ value, display }) => (
                <Radio key={value} value={value}>
                  {display}
                </Radio>
              ))}
            </RadioGroup>,
          )}
        </FormItem>
        <FormItem label="工位">
          {getFieldDecorator('workstationId', {
            rules: [{ required: true, message: '工位不能为空' }],
          })(<WorkstationAndAreaSelect onlyWorkstations params={{ status: 1 }} />)}
        </FormItem>
        <FormItem label="规则">
          {getFieldDecorator('type', {
            rules: [{ required: true, message: '规则不能为空' }],
          })(
            <Select>
              {TYPES.map(({ value, display }) => (
                <Option key={value} value={value}>
                  {display}
                </Option>
              ))}
            </Select>,
          )}
        </FormItem>
        <FormItem label={'准备时间'}>
          {getFieldDecorator('time', {
            rules: [{ required: true, message: '时间必填' }, { validator: amountValidator() }],
          })(<InputNumber />)}{' '}
          {getFieldDecorator('unit', {
            initialValue: 'm',
            onChange: unit => {
              const oldTime = getFieldValue('time');
              const oldUnit = getFieldValue('unit');
              let time = oldTime;
              if (!time) {
                return;
              }
              if (oldUnit === 'm' && unit === 'h') {
                time = new BigJs(time)
                  .div(60)
                  .round(6)
                  .valueOf();
              } else if (oldUnit === 'h' && unit === 'm') {
                time = new BigJs(time)
                  .times(60)
                  .round(6)
                  .valueOf();
                setFieldsValue({ time });
              }
            },
          })(
            <Select style={{ width: 100 }}>
              <Option value={'h'}>小时</Option>
              <Option value={'m'}>分钟</Option>
            </Select>,
          )}
        </FormItem>
      </Form>
    );
  }
}

export default BaseForm;
